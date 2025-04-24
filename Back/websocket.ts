import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

const connections: WebSocket[] = [];
const router = new Router();

router.get("/", (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.throw(501);
  }
  const ws = ctx.upgrade();
  connections.push(ws);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
    connections.forEach((client) => {
      client.send(JSON.stringify(data));
    });
  };

  ws.onclose = () => {
    const index = connections.indexOf(ws);
    if (index !== -1) {
      connections.splice(index, 1);
    }
  };
});

export default router;
