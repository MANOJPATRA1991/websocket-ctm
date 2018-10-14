import * as SocketServer from 'ws';

export default interface ExtWebSocket extends SocketServer {
    isAlive: boolean;
    id: number;
}