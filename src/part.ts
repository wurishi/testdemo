import createBoardcast from "./lib/broadcast"
import { getWindowRect } from "./lib/utils";

(() => {
    const broadcast = createBoardcast();
    broadcast.init();
    // broadcast.receiveMessage((evt: MessageEvent) => {

    // })
    const id = Date.now() + '_' + Math.random();
    let rect = getWindowRect('body');
    const update = () => {
        rect = getWindowRect('body');
        broadcast.sendMessage({
            type: 'move',
            id,
            rect,
        })
        requestAnimationFrame(update);
    }
    window.addEventListener('resize', update);
    requestAnimationFrame(update);
})()