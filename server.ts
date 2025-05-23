import { Application, Router, send } from "https://deno.land/x/oak@v12.6.1/mod.ts";
// import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const app = new Application();
const router = new Router();

const STATIC_DIR = "./dist";

router.get("/assets/(.*)", async (ctx) => {
  await send(ctx, ctx.request.url.pathname, {
    root: STATIC_DIR,
  });
});

// Route pour toutes les autres requêtes - renvoie index.html pour le routage côté client
router.get("/(.*)", async (ctx) => {
  await send(ctx, "index.html", {
    root: STATIC_DIR,
  });
});

app.use(router.routes());
app.use(router.allowedMethods());

if (Deno.args.length >= 3) {
  options.secure = true;
  options.cert = await Deno.readTextFile(Deno.args[1]);
  options.key = await Deno.readTextFile(Deno.args[2]);
  console.log(`SSL conf ready (use https)`);
}

await app.listen({ port: 80 });
