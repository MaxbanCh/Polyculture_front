import { Application, Router, send } from "https://deno.land/x/oak@v12.6.1/mod.ts";

const app = new Application();
const router = new Router();
const STATIC_DIR = "./dist";

// Middleware pour logger les requêtes
app.use(async (ctx, next) => {
  await next();
  console.log(`${ctx.request.method} ${ctx.request.url.pathname}`);
});

// Servir les fichiers statiques avec priorité
router.get("/assets/(.*)", async (ctx) => {
  await send(ctx, ctx.request.url.pathname, {
    root: STATIC_DIR,
  });
});

// Servir les autres fichiers statiques
router.get("/(favicon.ico|robots.txt|images/.*)", async (ctx) => {
  await send(ctx, ctx.request.url.pathname, {
    root: STATIC_DIR,
  });
});

// Route pour toutes les autres requêtes - renvoie index.html pour SPA
router.get("/(.*)", async (ctx) => {
  await send(ctx, "index.html", {
    root: STATIC_DIR,
  });
});

app.use(router.routes());
app.use(router.allowedMethods());

// Configuration du serveur
const PORT = parseInt(Deno.env.get("PORT") || "80");  // Port HTTP standard
const options: any = { port: PORT };

console.log(`Serveur frontend démarré sur http://localhost:${PORT}`);  // HTTP en interne
await app.listen(options);