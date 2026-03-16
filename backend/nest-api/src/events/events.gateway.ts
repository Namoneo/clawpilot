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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, { userId: number; socketId: string }>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number },
  ) {
    this.connectedClients.set(client.id, { userId: data.userId, socketId: client.id });
    client.join(`user:${data.userId}`);
    return { event: 'joined', data: { userId: data.userId } };
  }

  @SubscribeMessage('join:agent')
  handleJoinAgent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { agentId: number },
  ) {
    client.join(`agent:${data.agentId}`);
    return { event: 'joined:agent', data: { agentId: data.agentId } };
  }

  // Emit methods for other services
  emitAgentStarted(agentId: number, userId: number, data: any) {
    this.server.to(`agent:${agentId}`).emit('agent:started', data);
    this.server.to(`user:${userId}`).emit('agent:started', data);
  }

  emitAgentStopped(agentId: number, userId: number, data: any) {
    this.server.to(`agent:${agentId}`).emit('agent:stopped', data);
    this.server.to(`user:${userId}`).emit('agent:stopped', data);
  }

  emitAgentFailed(agentId: number, userId: number, data: any) {
    this.server.to(`agent:${agentId}`).emit('agent:failed', data);
    this.server.to(`user:${userId}`).emit('agent:failed', data);
  }

  emitRunCompleted(agentId: number, userId: number, data: any) {
    this.server.to(`agent:${agentId}`).emit('run:completed', data);
    this.server.to(`user:${userId}`).emit('run:completed', data);
  }

  emitNotification(userId: number, data: any) {
    this.server.to(`user:${userId}`).emit('notification', data);
  }
}
