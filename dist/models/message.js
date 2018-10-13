"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Message {
    constructor(content, isBroadcast = false, sender) {
        this.content = content;
        this.isBroadcast = isBroadcast;
        this.sender = sender;
    }
}
exports.Message = Message;
