import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { create, verify } from "https://deno.land/x/djwt/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { Client } from "https://deno.land/x/postgres/mod.ts";


const router = new Router();
const app = new Application();

app.use(
  oakCors({
    origin: "http://83.195.188.17", // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
    credentials: true, // Allow credentials like cookies
  })
);


app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "http://83.195.188.17");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  ctx.response.headers.set("Access-Control-Allow-Credentials", "true");
  await next();
});

// const client = new Client({
//   user: "postgres",
//   database: "postgres",
//   hostname: "localhost",
//   port: 5432,
//   password: "admin", // Ajoutez votre mot de passe ici
// });

// await client.connect();

// try {
//   const result = await client.queryArray(`SELECT * FROM votre_table`);
//   console.log(result.rows);
// } catch (err) {
//   console.error("Erreur lors de l'exécution de la requête", err);
// } finally {
//   await client.end();
// }


// WebSockets -----
const is_authorized = async (auth_token: string) => {
  if (!auth_token) {
    return false;
  }
  console.log("auth_token", auth_token);
  if (auth_token in tokens) {
    try {
      const payload = await verify(auth_token, secretKey);
      if (payload.userName === tokens[auth_token]) {
        return true;
      }
    } catch {
      console.log("verify token failed");
      return false;
    }
  }
  console.log("Unknown token");
  return false;
};

const connections: WebSocket[] = [];


// Connection related variables
const tokens: { [key: string]: string } = {};

// Function to remove a token based on the user
function removeTokenByUser(user: string) {
  for (const token in tokens) {
    if (tokens[token] === user) {
      delete tokens[token];
      break;
    }
  }
}

const secretKey = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"]
);

router.get("/get_cookies", (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = "Miam les cookies !";
}); 


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

if (Deno.args.length < 1) {
  console.log(
    `Usage: $ deno run --allow-net server.ts PORT [CERT_PATH KEY_PATH]`,
  );
  Deno.exit();
}

const options = { port: Deno.args[0] };

if (Deno.args.length >= 3) {
  options.secure = true;
  options.cert = await Deno.readTextFile(Deno.args[1]);
  options.key = await Deno.readTextFile(Deno.args[2]);
  console.log(`SSL conf ready (use https)`);
}

console.log(`Oak back server running on port ${options.port}`);

/////////////////////////////////////////////////////////////////////


async function get_hash(password: string): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);  // Generate the salt manually
  return await bcrypt.hash(password, salt);  // Pass the salt to the hash function
}

const users = [
  { id: '1', username: 'Superman', password_hash: await get_hash('Superman'), last_action_date: 0 },
  { id: '2', username: 'Mickey_Mouse', password_hash: await get_hash('Mickey_Mouse'), last_action_date: 0 },
  { id: '3', username: 'James_Bond', password_hash: await get_hash('James_Bond'), last_action_date: 0 },
  { id: '4', username: 'Bugs_Bunny', password_hash: await get_hash('Bugs_Bunny'), last_action_date: 0 },
  { id: '5', username: 'Batman', password_hash: await get_hash('Batman'), last_action_date: 0 },
  { id: '6', username: 'Dorothy_Gale', password_hash: await get_hash('Dorothy_Gale'), last_action_date: 0 },
  { id: '0', username: 'Maxban', password_hash: await get_hash('Maxban'), last_action_date: 0 },
];


const questions = [
    { id: '1', question: 'Combien de planetes dans le systeme solaire ?', answer: '8' },
    { id: '2', question: 'Dans la mythologie grecque, quel est le dieu associe au vin ?', answer: 'Dionysos' },
    { id: '3', question: 'Combien y a-t-il de pays membre de l Union Européenne ?', answer: '27' },
]
///////////////////////////////////////////////////////

function notifyAllUsers(json: any) {
  connections.forEach((client) => {
    client.send(JSON.stringify(json));
  });
}


////////////////////// Functions for the game ///////////////////////
router.get("/question", async (ctx) => {
  const body = await ctx.request.body().value;
  console.log(body);
});



function questionThemed(data : any) {
  const question = questions[Math.floor(Math.random() * questions.length)];

  return
}


function challengeSolo(data : any) {
  
}

router.get("/", (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.throw(501);
  }
  const ws = ctx.upgrade();

  connections.push(ws);
  console.log(`+ websocket connected (${connections.length})`);

  ws.onerror = (_error) => {
    const index = connections.indexOf(ws);
    if (index !== -1) {
      connections.splice(index, 1);
    }
    console.log(`- websocket error`);
  };

  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
    console.log(data.type)


    if (data.type == "buzz") {
        // if (user.last_action_date + 1000 > Date.now()) {
        //     ws.send(JSON.stringify({ too_early: true }));
        //     return
        // }
        console.log(`- buzzer pressed by ${data.data.name}`);
        // user.last_action_date = Date.now();
        notifyAllUsers({ type: "buzz", owner: data.data.name });
        return
    }

    if (data.type == "question") {
        console.log(`- question asked by ${data.data.name}`);
        notifyAllUsers({ type: "question", owner: data.data.name, question: data.data.question });
        return
    }

    if (data.type == "answer") {
        console.log(`- answer sent by ${data.data.name}`);
        notifyAllUsers({ type: "answer", owner: data.data.name, answer: data.data.answer });
        return
    }
  };

  ws.onclose = () => {
    const index = connections.indexOf(ws);
    if (index !== -1) {
      connections.splice(index, 1);
    }
    console.log(`- websocket disconnected (${connections.length})`);
  };
});


app.use(async (ctx, next) => {
  await next();
  console.log(ctx.request.url.pathname);
});

app.use(router.routes());
app.use(router.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());
await app.listen(options);
