import { Boardcast } from "./broadcast";

export default class MyLocalStorage implements Boardcast {

    private _callback?: Function;

    constructor(private rootName: string) {
    }

    init(): void {
        window.addEventListener('storage', evt => {
            if (evt.newValue && this._callback) {
                const rootData = JSON.parse(evt.newValue!);
                Reflect.ownKeys(rootData).forEach(id => {
                    this._callback && this._callback({
                        type: 'mymessage',
                        data: {
                            type: 'move', id, rect: rootData[id]
                        }
                    })
                })
            }

        })
    }

    private getData() {
        const rootStr = localStorage.getItem(this.rootName) || '{}';
        const rootData = JSON.parse(rootStr);
        return rootData;
    }

    sendMessage(data: any): void {
        const rootData = this.getData();
        switch (data.type) {
            case 'move': {
                const { id, rect } = data;
                rootData[id] = rect;
                localStorage.setItem(this.rootName, JSON.stringify(rootData));
            } break;
            default: ;
        }
    }

    receiveMessage(callback: Function): void {
        this._callback = callback;
    }
}