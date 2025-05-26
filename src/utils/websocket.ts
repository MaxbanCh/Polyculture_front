const ws = new WebSocket(`ws://polyculture-back.cluster-ig3.igpolytech.fr/`);

ws.onopen = () => {
  console.log("WebSocket connection established.");
};

ws.onclose = () => {
  console.log("WebSocket connection closed.");
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

export default ws;
