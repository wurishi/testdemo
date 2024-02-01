import { Boardcast } from "./broadcast";
import SW from './worker.js?sharedworker';

export default class MySharedWorker implements Boardcast {

    private worker: SharedWorker;
    constructor(private name: string) {
        this.worker = new SW();
        console.log(this.worker);
    }

    init(): void {

    }

    sendMessage(data: any): void {
        this.worker.port.postMessage(data);
    }

    receiveMessage<T extends (event: MessageEvent) => void>(callback: T): void {
        this.worker.port.onmessage = callback;
    }
}