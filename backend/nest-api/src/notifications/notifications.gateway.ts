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
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: number }) {
    const { userId } = data;
    client.join(`user:${userId}`);
    console.log(`User ${userId} subscribed to notifications`);
    return { event: 'subscribed', userId };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: number }) {
    const { userId } = data;
    client.leave(`user:${userId}`);
    return { event: 'unsubscribed', userId };
  }

  // Server-side method to send notification to specific user
  sendToUser(userId: number, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  // Broadcast to all connected clients
  broadcast(notification: any) {
    this.server.emit('notification', notification);
  }
}
