from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, Text, select
from datetime import datetime
import redis.asyncio as redis
import json
import os

app = FastAPI(title="ClawPilot AI Orchestrator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/clawpilot")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

redis_client = redis.from_url(REDIS_URL, decode_responses=True)


# Models
class AgentWorkflow(Base):
    __tablename__ = "agent_workflows"
    
    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, nullable=False)
    task = Column(Text, nullable=False)
    status = Column(String, default="pending")
    result = Column(Text, nullable=True)
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Schemas
class TaskRequest(BaseModel):
    agent_id: int
    task: str
    context: Optional[Dict[str, Any]] = {}


class TaskResponse(BaseModel):
    workflow_id: int
    status: str
    result: Optional[str] = None
    tokens_used: int = 0


class AgentState(BaseModel):
    task: str
    context: Dict[str, Any] = {}
    plan: Optional[str] = None
    research: Optional[str] = None
    code: Optional[str] = None
    tests: Optional[str] = None
    review: Optional[str] = None
    result: Optional[str] = None
    tokens_used: int = 0
    errors: List[str] = []


# LangGraph Workflow
from langgraph.graph import StateGraph, END

def create_agent_graph():
    """Create the agent workflow graph using LangGraph"""
    
    def planner_node(state: AgentState) -> AgentState:
        """Planner: Create implementation plan"""
        # Use LLM to create a plan
        state.plan = f"Plan for: {state.task}"
        return state
    
    def researcher_node(state: AgentState) -> AgentState:
        """Researcher: Gather relevant information"""
        state.research = f"Research findings for: {state.task}"
        return state
    
    def coder_node(state: AgentState) -> AgentState:
        """Coder: Generate code"""
        state.code = f"Code implementation for: {state.task}"
        state.tokens_used += 100
        return state
    
    def tester_node(state: AgentState) -> AgentState:
        """Test Runner: Run tests"""
        state.tests = f"Tests for: {state.task}"
        return state
    
    def reviewer_node(state: AgentState) -> AgentState:
        """Reviewer: Analyze code"""
        state.review = f"Review for: {state.task}"
        return state
    
    def final_node(state: AgentState) -> AgentState:
        """Final: Return result"""
        state.result = f"Completed: {state.task}"
        return state
    
    # Create graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("planner", planner_node)
    workflow.add_node("researcher", researcher_node)
    workflow.add_node("coder", coder_node)
    workflow.add_node("tester", tester_node)
    workflow.add_node("reviewer", reviewer_node)
    workflow.add_node("final", final_node)
    
    # Add edges
    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "researcher")
    workflow.add_edge("researcher", "coder")
    workflow.add_edge("coder", "tester")
    workflow.add_edge("tester", "reviewer")
    workflow.add_edge("reviewer", "final")
    workflow.add_edge("final", END)
    
    return workflow.compile()


# Initialize graph
agent_graph = create_agent_graph()


@app.get("/")
async def root():
    return {"message": "ClawPilot AI Orchestrator", "version": "1.0.0"}


@app.post("/execute", response_model=TaskResponse)
async def execute_task(request: TaskRequest, background_tasks: BackgroundTasks):
    """Execute an agent task through the workflow"""
    
    # Create workflow record
    async with async_session() as session:
        workflow = AgentWorkflow(
            agent_id=request.agent_id,
            task=request.task,
            status="running"
        )
        session.add(workflow)
        await session.commit()
        await session.refresh(workflow)
        workflow_id = workflow.id
    
    # Queue the task in Redis
    task_data = {
        "workflow_id": workflow_id,
        "agent_id": request.agent_id,
        "task": request.task,
        "context": request.context
    }
    await redis_client.lpush("agent_tasks", json.dumps(task_data))
    
    return TaskResponse(
        workflow_id=workflow_id,
        status="queued"
    )


@app.get("/workflow/{workflow_id}")
async def get_workflow_status(workflow_id: int):
    """Get workflow status"""
    async with async_session() as session:
        result = await session.execute(
            select(AgentWorkflow).where(AgentWorkflow.id == workflow_id)
        )
        workflow = result.scalar_one_or_none()
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        return {
            "id": workflow.id,
            "agent_id": workflow.agent_id,
            "task": workflow.task,
            "status": workflow.status,
            "result": workflow.result,
            "tokens_used": workflow.tokens_used,
            "created_at": workflow.created_at.isoformat(),
            "updated_at": workflow.updated_at.isoformat()
        }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
