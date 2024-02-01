import MyBroadcastChannel from "./MyBroadcastChannel";
import MyLocalStorage from "./MyLocalStorage";
import MySharedWorker from "./MySharedWorker";

export interface Boardcast {
    init(): void;
    sendMessage(data: any): void;
    receiveMessage(callback: Function): void;
}

export default function createBoardcast(): Boardcast {
    return new MyBroadcastChannel('helloworld');
    // return new MySharedWorker('www');
    // return new MyLocalStorage('rte');
}