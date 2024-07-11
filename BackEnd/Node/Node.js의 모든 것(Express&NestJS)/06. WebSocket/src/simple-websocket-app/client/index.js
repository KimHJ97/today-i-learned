const ws = new WebSocket('ws://localhost:7071/ws');

ws.onmessage = (webSocketMessage) => {
    console.log(webSocketMessage)
    console.log(webSocketMessage.data);
}

document.body.onmousemove = (event) => {
    const messageBody = {
        x: event.clientX,
        y: event.clientY
    }
    ws.send(JSON.stringify(messageBody));
}