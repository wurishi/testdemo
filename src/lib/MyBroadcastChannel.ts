import { Boardcast } from "./broadcast";

export default class MyBroadcastChannel implements Boardcast {

    private broadcastChannel: BroadcastChannel;

    constructor(private name: string) {
        this.broadcastChannel = new BroadcastChannel(this.name);
    }

    init(): void {

    }

    sendMessage(data: any): void {
        this.broadcastChannel.postMessage(data);
    }

    receiveMessage<T extends (evt: MessageEvent) => void>(callback: T): void {
        this.broadcastChannel.onmessage = callback;
    }
}