const ws = new WebSocket(`wss://polyculture-back.axithem.fr/`);

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
