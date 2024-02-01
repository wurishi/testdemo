const connections = [];

onconnect = function (e) {
    const port = e.ports[0];
    connections.push(port);

    port.onmessage = (event) => {
        connections.forEach(item => {
            if (item !== port) {
                item.postMessage(event.data);
            }
        })
    }

    port.start();
}