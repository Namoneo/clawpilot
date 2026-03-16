#!/usr/bin/env python3
"""
ClawPilot Worker - Processes agent tasks from Redis queue
and executes them in Docker containers
"""

import asyncio
import json
import os
import sys
import time
from datetime import datetime
from typing import Dict, Any, Optional

import redis.asyncio as redis
import httpx
import docker
from docker.errors import NotFound, APIError


class Worker:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.api_url = os.getenv("API_URL", "http://localhost:3000")
        self.openclaw_runtime = os.getenv("OPENCLAW_RUNTIME", "/usr/local/bin/openclaw")
        self.docker_client = docker.from_env()
        self.redis_client: Optional[redis.Redis] = None
        self.running = True
        
    async def connect(self):
        """Connect to Redis"""
        self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
        print("✅ Connected to Redis")
        
    async def process_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single agent task"""
        workflow_id = task_data.get("workflow_id")
        agent_id = task_data.get("agent_id")
        task = task_data.get("task")
        context = task_data.get("context", {})
        
        print(f"🔄 Processing workflow {workflow_id}: {task}")
        
        result = {
            "workflow_id": workflow_id,
            "status": "running",
            "logs": [],
            "tokens_used": 0
        }
        
        try:
            # Update workflow status
            await self.update_workflow_status(workflow_id, "running", "", 0)
            
            # Run the agent in Docker container
            container_result = await self.run_agent_container(agent_id, task, context)
            
            result["status"] = "completed"
            result["logs"] = container_result.get("logs", [])
            result["tokens_used"] = container_result.get("tokens", 0)
            
            # Update workflow as completed
            await self.update_workflow_status(
                workflow_id, 
                "completed", 
                json.dumps(result["logs"]),
                result["tokens_used"]
            )
            
            print(f"✅ Workflow {workflow_id} completed")
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Workflow {workflow_id} failed: {error_msg}")
            result["status"] = "failed"
            result["logs"].append(f"Error: {error_msg}")
            
            await self.update_workflow_status(
                workflow_id,
                "failed",
                json.dumps(result["logs"]),
                result["tokens_used"]
            )
        
        return result
    
    async def run_agent_container(
        self, 
        agent_id: int, 
        task: str, 
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run agent task in Docker container"""
        
        container_name = f"clawpilot-agent-{agent_id}-{int(time.time())}"
        
        # Get agent configuration from API
        agent_config = await self.get_agent_config(agent_id)
        
        # Build OpenClaw command
        cmd = [
            "openclaw", "agent", "run",
            "--task", task,
            "--model", agent_config.get("model", "claude-sonnet"),
        ]
        
        # Add routing config if provided
        routing = agent_config.get("routing", {})
        if routing:
            cmd.extend(["--routing", json.dumps(routing)])
        
        print(f"🚀 Starting container: {container_name}")
        print(f"📝 Command: {' '.join(cmd)}")
        
        logs = []
        tokens = 0
        
        try:
            # Pull OpenClaw image if not exists
            try:
                self.docker_client.images.get("openclaw/openclaw:latest")
            except NotFound:
                print("📦 Pulling OpenClaw image...")
                self.docker_client.images.pull("openclaw/openclaw:latest")
            
            # Run container
            container = self.docker_client.containers.run(
                "openclaw/openclaw:latest",
                command=cmd,
                name=container_name,
                detach=True,
                environment={
                    "CLAW_TASK": task,
                    "CLAW_AGENT_ID": str(agent_id),
                },
                volumes={
                    os.path.expanduser("~/.openclaw"): {"bind": "/root/.openclaw", "mode": "ro"}
                },
                remove=True
            )
            
            # Wait for container to finish
            container.wait()
            
            # Get logs
            logs = container.logs(stdout=True, stderr=True).decode("utf-8").split("\n")
            
            # Get container stats for token estimation
            stats = container.stats(stream=False)
            # Simple token estimation based on output length
            tokens = len(" ".join(logs)) // 4
            
            print(f"📊 Tokens used (estimated): {tokens}")
            
        except APIError as e:
            print(f"🐳 Docker API error: {e}")
            logs.append(f"Docker error: {e}")
        except Exception as e:
            print(f"❌ Container error: {e}")
            logs.append(f"Error: {e}")
        
        return {
            "logs": logs,
            "tokens": tokens
        }
    
    async def get_agent_config(self, agent_id: int) -> Dict[str, Any]:
        """Get agent configuration from API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_url}/api/agents/{agent_id}",
                    timeout=10.0
                )
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            print(f"⚠️ Could not fetch agent config: {e}")
        
        # Return default config
        return {
            "model": "claude-sonnet",
            "routing": {
                "planning": "openrouter/anthropic/claude-3.5-sonnet",
                "coding": "ollama/deepseek-coder-v2:latest",
                "review": "openrouter/anthropic/claude-3.5-sonnet"
            }
        }
    
    async def update_workflow_status(
        self, 
        workflow_id: int, 
        status: str, 
        logs: str, 
        tokens: int
    ):
        """Update workflow status in API"""
        try:
            async with httpx.AsyncClient() as client:
                await client.patch(
                    f"{self.api_url}/api/workflows/{workflow_id}",
                    json={
                        "status": status,
                        "logs": logs,
                        "tokens_used": tokens
                    },
                    timeout=10.0
                )
        except Exception as e:
            print(f"⚠️ Could not update workflow status: {e}")
    
    async def run(self):
        """Main worker loop"""
        print("🎯 ClawPilot Worker starting...")
        
        await self.connect()
        
        while self.running:
            try:
                # Blocking pop from Redis queue
                result = await self.redis_client.brpop("agent_tasks", timeout=5)
                
                if result:
                    _, task_json = result
                    task_data = json.loads(task_json)
                    await self.process_task(task_data)
                    
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"❌ Worker error: {e}")
                await asyncio.sleep(1)
        
        await self.cleanup()
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.redis_client:
            await self.redis_client.close()
        print("👋 Worker stopped")


async def main():
    worker = Worker()
    
    try:
        await worker.run()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
        worker.running = False
        await worker.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
