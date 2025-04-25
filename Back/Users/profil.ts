import { client } from "../database/client.ts";
import router from "../utils/router.ts";


router.post("/login", async (ctx) => {
  const body = await ctx.request.body().value;
  const { username, password } = body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid username or password" };
    return;
  }

  const result = await bcrypt.compare(password, user.password_hash);
  if (!result) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid username or password" };
    return;
  }

  const token = await create({ alg: "HS512", typ: "JWT" }, { userName: username }, secretKey);
  ctx.response.headers.set("Set-Cookie", `auth_token=${token}; HttpOnly; Max-Age=3600; SameSite=Strict; `);

  removeTokenByUser(username);
  tokens[token] = username;

  ctx.response.status = 200;
  ctx.response.body = { auth_token: token };
});


router.post("/logout", async (ctx) => {
  const token = ctx.request.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { error: "No token provided" };
    return;
  }

  const user = tokens[token];
  if (user) {
    delete tokens[token];
    ctx.response.headers.set("Set-Cookie", `auth_token=; HttpOnly; Max-Age=0; SameSite=Strict; `);
    ctx.response.status = 200;
    ctx.response.body = { message: "Logged out successfully" };
  } else {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid token" };
  }
});

router.get("/profil", async (ctx) => {
  const token = ctx.request.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { error: "No token provided" };
    return;
  }

  const user = tokens[token];
  if (!user) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid token" };
    return;
  }

  const decodedToken = await verify(token, secretKey);
  if (!decodedToken) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid token" };
    return;
  }

  ctx.response.status = 200;
  ctx.response.body = { userName: decodedToken.userName };
});

router.get("/admin", async (ctx) => {
  const authHeader = ctx.request.headers.get("Authorization");
  if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Unauthorized" };
      return;
  }

  const token = authHeader.split(" ")[1];
  try {
      const payload = await verify(token, secretKey);
      if (payload.role !== "admin") {
          ctx.response.status = 403;
          ctx.response.body = { error: "Forbidden" };
          return;
      }

      ctx.response.status = 200;
      ctx.response.body = { isAdmin: true };
  } catch {
      ctx.response.status = 401;
      ctx.response.body = { error: "Invalid token" };
  }
});