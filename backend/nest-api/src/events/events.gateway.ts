import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients = new Map<string, { userId: number; agentId?: number }>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number; agentId?: number },
  ) {
    const { userId, agentId } = data;
    this.connectedClients.set(client.id, { userId, agentId });
    
    if (agentId) {
      client.join(`agent:${agentId}`);
      this.logger.log(`User ${userId} joined agent ${agentId} room`);
    }
    
    return { event: 'joined', data: { userId, agentId } };
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() data: { agentId: number }) {
    const { agentId } = data;
    client.leave(`agent:${agentId}`);
    this.logger.log(`Left agent ${agentId} room`);
    
    return { event: 'left', data: { agentId } };
  }

  // Server-side methods to emit events
  emitAgentLog(agentId: number, log: string) {
    this.server.to(`agent:${agentId}`).emit('agent:log', { agentId, log, timestamp: new Date() });
  }

  emitAgentStatus(agentId: number, status: string) {
    this.server.to(`agent:${agentId}`).emit('agent:status', { agentId, status, timestamp: new Date() });
  }

  emitWorkflowUpdate(workflowId: number, update: any) {
    this.server.emit('workflow:update', { workflowId, ...update });
  }

  emitMetricsUpdate(metrics: any) {
    this.server.emit('metrics:update', metrics);
  }
}
