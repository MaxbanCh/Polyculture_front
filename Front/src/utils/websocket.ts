const ws = new WebSocket(`ws://83.195.188.17/:3000`);

ws.onopen = () => {
    console.log('WebSocket connection established.');
};

ws.onclose = () => {
    console.log('WebSocket connection closed.');
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

export default ws;