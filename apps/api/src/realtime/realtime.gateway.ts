import { JwtService } from "@nestjs/jwt";
import {
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
} from "@nestjs/websockets";
import type { RealtimeEvents } from "@repo/library";
import { Server, type Socket } from "socket.io";

import type { AccessTokenPayload } from "../auth/jwt-auth.guard";

const FEED_ROOM = "feed";

@WebSocketGateway({ transports: ["websocket"] })
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(socket: Socket): Promise<void> {
    const token = (socket.handshake.auth as { token?: string }).token;
    try {
      await this.jwtService.verifyAsync<AccessTokenPayload>(token ?? "");
      await socket.join(FEED_ROOM);
    } catch {
      socket.disconnect(true);
    }
  }

  publish<E extends keyof RealtimeEvents>(
    event: E,
    payload: RealtimeEvents[E],
  ): void {
    this.server.to(FEED_ROOM).emit(event, payload);
  }
}
