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

interface ClientInfo {
  userId?: number;
  socketId: string;
  agentIds?: number[];
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, ClientInfo>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, { socketId: client.id });
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
    const info = this.connectedClients.get(client.id) || { socketId: client.id };
    info.userId = data.userId;
    this.connectedClients.set(client.id, info);
    client.join(`user:${data.userId}`);
    return { event: 'joined', data: { userId: data.userId } };
  }

  @SubscribeMessage('join:agent')
  handleJoinAgent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { agentId: number },
  ) {
    const info = this.connectedClients.get(client.id) || { socketId: client.id };
    if (!info.agentIds) {
      info.agentIds = [];
    }
    if (!info.agentIds.includes(data.agentId)) {
      info.agentIds.push(data.agentId);
    }
    this.connectedClients.set(client.id, info);
    client.join(`agent:${data.agentId}`);
    return { event: 'joined:agent', data: { agentId: data.agentId } };
  }

  @SubscribeMessage('leave:agent')
  handleLeaveAgent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { agentId: number },
  ) {
    const info = this.connectedClients.get(client.id);
    if (info?.agentIds) {
      info.agentIds = info.agentIds.filter(id => id !== data.agentId);
      this.connectedClients.set(client.id, info);
    }
    client.leave(`agent:${data.agentId}`);
    return { event: 'left:agent', data: { agentId: data.agentId } };
  }

  // Emit methods for other services
  emitAgentStarted(agentId: number, userId: number, data: unknown) {
    // Notify both agent room and user room
    this.server.to(`agent:${agentId}`).emit('agent:started', data);
    this.server.to(`user:${userId}`).emit('agent:started', data);
  }

  emitAgentStopped(AgentId: number, userId: number, data: unknown) {
    this.server.to(`agent:${AgentId}`).emit('agent:stopped', data);
    this.server.to(`user:${userId}`).emit('agent:stopped', data);
  }

  emitAgentFailed(agentId: number, userId: number, data: unknown) {
    this.server.to(`agent:${agentId}`).emit('agent:failed', data);
    this.server.to(`user:${userId}`).emit('agent:failed', data);
  }

  emitRunCompleted(agentId: number, userId: number, data: unknown) {
    this.server.to(`agent:${agentId}`).emit('run:completed', data);
    this.server.to(`user:${userId}`).emit('run:completed', data);
  }

  emitNotification(userId: number, data: unknown) {
    this.server.to(`user:${userId}`).emit('notification', data);
  }
}
