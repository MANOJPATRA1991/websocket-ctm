import * as WebSocket from 'ws';

export default interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
    id: number;
}