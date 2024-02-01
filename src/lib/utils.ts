export function getWindowRect(documentSelector: string) {
    const result = {
        x: 0, y: 0, w: 0, h: 0,
    };
    const barHeight = window.outerHeight - window.innerHeight;
    const element = document.querySelector(documentSelector);
    if (element) {
        const rect = element.getBoundingClientRect();
        result.x = rect.left;
        result.y = rect.top;
        result.w = rect.width;
        result.h = rect.height;
    }
    result.x += window.screenX;
    result.y += window.screenY + barHeight;
    return result;
}