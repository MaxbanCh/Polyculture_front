// import { Application, Router, send } from "https://deno.land/x/oak@v12.6.1/mod.ts";
// // import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

// const app = new Application();
// const router = new Router();

// const STATIC_DIR = "./dist";

// router.get("/assets/(.*)", async (ctx) => {
//   await send(ctx, ctx.request.url.pathname, {
//     root: STATIC_DIR,
//   });
// });

// // Route pour toutes les autres requêtes - renvoie index.html pour le routage côté client
// router.get("/(.*)", async (ctx) => {
//   await send(ctx, "index.html", {
//     root: STATIC_DIR,
//   });
// });

// app.use(router.routes());
// app.use(router.allowedMethods());

// if (Deno.args.length >= 3) {
//   options.secure = true;
//   options.cert = await Deno.readTextFile(Deno.args[1]);
//   options.key = await Deno.readTextFile(Deno.args[2]);
//   console.log(`SSL conf ready (use https)`);
// }

// await app.listen({ port: 80 });

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

// Route pour toutes les autres requêtes - SPA routing
router.get("/(.*)", async (ctx) => {
  await send(ctx, "index.html", {
    root: STATIC_DIR,
  });
});

app.use(router.routes());
app.use(router.allowedMethods());

// Configuration du serveur
const options: any = { port: 80 };

// Vérifier et configurer SSL si les certificats sont fournis
if (Deno.args.length >= 2) {
  const certPath = Deno.args[0];
  const keyPath = Deno.args[1];
  
  try {
    // Vérifier que les fichiers existent
    await Deno.stat(certPath);
    await Deno.stat(keyPath);
    
    // Lire le contenu des certificats
    const cert = await Deno.readTextFile(certPath);
    const key = await Deno.readTextFile(keyPath);
    
    // Configurer les options SSL avec le contenu des fichiers
    options.secure = true;
    options.cert = cert;
    options.key = key;
    console.log(`SSL configuration prête (utiliser HTTPS)`);
  } catch (error) {
    console.error(`Erreur lors du chargement des certificats SSL: ${error.message}`);
    console.error(`Chemins: cert=${certPath}, key=${keyPath}`);
    console.error("Démarrage en mode HTTP...");
  }
}

// Démarrer le serveur
console.log(`Serveur frontend démarré sur ${options.secure ? 'https' : 'http'}://localhost:${options.port}`);
await app.listen(options);