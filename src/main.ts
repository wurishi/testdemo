import { fragment, vertex } from "./webgl";
import S from './test'
import WebGLCanvas from "./lib/WebGLCanvas";
import { getWindowRect } from "./lib/utils";
import createBoardcast from "./lib/broadcast";

(() => {
  let webGL = new WebGLCanvas();
  document.body.appendChild(webGL.canvas);

  const v = vertex;
  const f = fragment.replace('{USER_FRAGMENT}', S);

  webGL.createProgram(v, f);
  const uiCount = webGL.getUniformLocation('count');
  const uiItemPos = webGL.getUniformLocation('itemPos');

  let then = 0, time = 0, frame = 0;
  let rect = { x: 0, y: 0, w: 0, h: 0 };
  const idToIndex = new Array<string>();
  const posArr = new Float32Array(12);

  const watchWindowPos = () => {
    rect = getWindowRect('body');
  }
  window.addEventListener('resize', watchWindowPos);
  watchWindowPos();

  const broadcast = createBoardcast();
  broadcast.init();
  const handleBroadcastEvent = (event: MessageEvent) => {
    if (event.data.type === 'move') {
      const {id, rect:itemRect} = event.data;
      let index = idToIndex.indexOf(id);
      if (index < 0) {
        index = idToIndex.length;
        idToIndex.push(id);
      }
      if (index < posArr.length) {
        posArr[index] = -(itemRect.y + (itemRect.h / 2)) / (rect.h || itemRect.h);
      }
    }
  }
  broadcast.receiveMessage(handleBroadcastEvent)

  const render = (now: number) => {
    now *= 0.001;
    const elapsedTime = Math.min(now - then, 0.1);
    then = now;
    frame++;
    time += elapsedTime;
    uiCount.uniform1i(idToIndex.length);
    uiItemPos.uniformFloatArray(posArr);
    webGL.resizeCanvasToDisplaySize()
    webGL.render({
      time, frame
    });
    if (frame % 30 === 0) {
      watchWindowPos();
    }
    broadcast.sendMessage({
      type: 'sync',
      time, frame, rect,
    })
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})()