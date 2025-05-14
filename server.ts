import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
// import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const app = new Application();
const router = new Router();


app.use(async (ctx) => {
  try {
    await ctx.send({
      root: `${Deno.cwd()}/`,
      index: "index.html",
    });
  } catch {
    ctx.response.status = 404;
    ctx.response.body = "404 File not found";
  }
});


app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Oak server without cors/csp running on http://${PORT}/`);
await app.listen({ port: 80 });
