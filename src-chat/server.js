const Database = require("better-sqlite3");
const fs = require("node:fs");
const path = require("node:path");
const dgram = require("node:dgram");
const { v4 } = require("uuid");
const WebSocket = require("ws");
const { ArgumentParser } = require("argparse");
const { version } = require("../package.json");
const parser = new ArgumentParser({
  description: "Send a message using multichat.",
});

parser.add_argument("-v", "--version", { action: "version", version });
parser.add_argument("-d", "--directory", {
  default: path.resolve(__dirname),
  help: "the directory to create the database",
});

const args = parser.parse_args();
const dbFile = path.join(args.directory, "chat.db");
const defaultServerAddress = "234.234.234.234";
const defaultServerPort = 5426;
const defaultServerKey = `${defaultServerAddress}:${defaultServerPort}`;
const wsPort = 3001;
const servers = {};
let wss;
let sqlite;

function setupDb() {
  console.log("[MultiChat]: Initializing db...");

  if (sqlite) {
    sqlite.close();
  }

  sqlite = new Database(dbFile);

  sqlite.exec(`create table if not exists me ( 
    id text primary key,
    username text not null,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp
  );`);

  sqlite.exec(`create table if not exists users ( 
      id text primary key,
      username text not null,
      address text not null,
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp
  );`);

  sqlite.exec(`create table if not exists room ( 
    id text primary key,
    user_id text not null,
    user_ids text not null,
    name text not null,
    address text not null,
    port int not null,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp
  );`);

  sqlite.exec(`create table if not exists chat ( 
      id text primary key,
      room_id text not null,
      user_id text not null,
      message text not null,
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp
  );`);

  console.log("[MultiChat]: done");
}

function setupWss() {
  console.log("[MultiChat]: Initializing wss...");

  if (wss) {
    wss.terminate();
  }

  wss = new WebSocket.WebSocketServer({ port: wsPort });

  wss.on("connection", (ws) => {
    console.log("[ws]: Connected");

    ws.on("message", (data) => {
      try {
        const json = JSON.parse(data);

        console.log("[ws]:", json);

        if (json.type === "me") {
          const rows = sqlite.prepare(`select * from me;`).all();

          if (rows.length === 0) {
            ws.send(JSON.stringify({ type: "me", data: null }));
          } else {
            ws.send(JSON.stringify({ type: "me", data: rows[0] }));
          }
        } else if (json.type === "me:update") {
          const rows = sqlite.prepare(`select * from me;`).all();
          const { username } = json;

          if (rows.length === 0) {
            sqlite
              .prepare(`insert into me (id, username) values (?, ?);`)
              .run(v4(), username);
          } else {
            sqlite
              .prepare(`update me set username = ?, updated_at = ?;`)
              .run(username, new Date().toISOString());
          }

          const newRows = sqlite.prepare(`select * from me;`).all();

          if (rows.length === 0) {
            ws.send(JSON.stringify({ type: "me", data: null }));
          } else {
            ws.send(JSON.stringify({ type: "me", data: newRows[0] }));
          }
        } else if (json.type === "chat") {
          const { address, port, ...rest } = json;

          servers[`${address}:${port}`].send(
            Buffer.from(JSON.stringify(rest)),
            port,
            address
          );
        } else if (json.type === "chat:update") {
          const { address, port, ...rest } = json;

          servers[defaultServerKey].send(
            Buffer.from(JSON.stringify(rest)),
            port,
            address
          );
        } else if (json.type === "chat:delete") {
          const { address, port, ...rest } = json;

          servers[defaultServerKey].send(
            Buffer.from(JSON.stringify(rest)),
            port,
            address
          );
        } else if (json.type === "chat:all") {
          const chats = sqlite
            .prepare(`select * from chat order by created_at desc;`)
            .all();

          ws.send(JSON.stringify({ type: "chat:all", data: chats }));
        } else if (json.type === "user") {
          const { address, port, ...rest } = json;

          servers[defaultServerKey].send(
            Buffer.from(JSON.stringify(rest)),
            port,
            address
          );
        } else if (json.type === "user:update") {
          const { address, port, ...rest } = json;

          servers[defaultServerKey].send(
            Buffer.from(JSON.stringify(rest)),
            port,
            address
          );
        } else if (json.type === "user:delete") {
          const { address, port, ...rest } = json;

          servers[defaultServerKey].send(
            Buffer.from(JSON.stringify(rest)),
            port,
            address
          );
        } else if (json.type === "user:all") {
          const users = sqlite.prepare(`select * from users;`).all();

          ws.send(JSON.stringify({ type: "user:all", data: users }));
        } else if (json.type === "room") {
          servers[defaultServerKey].send(
            Buffer.from(data),
            defaultServerPort,
            defaultServerAddress
          );
        } else if (json.type === "room:all") {
          const rooms = sqlite.prepare(`select * from room order by created_at asc;`).all();

          ws.send(JSON.stringify({ type: "room:all", data: rooms }));
        } else if (json.type === "cache:clear") {
          sqlite.close();

          fs.rmSync(dbFile);

          setupDb();
        }
      } catch (error) {
        console.error(error);
      }
    });
  });

  wss.on("error", (error) => {
    console.error("[ws]:", error);
  });

  wss.on("close", () => {
    console.log("[ws]: Disconnected");
  });

  console.log("[MultiChat]: done");
}

function setupServer(address = defaultServerAddress, port = defaultServerPort) {
  console.log("[MultiChat]: Initializing multicast...");

  const serverKey = `${address}:${port}`;

  if (servers[serverKey]) {
    return;
  }

  servers[serverKey] = dgram.createSocket({ type: "udp4", reuseAddr: true });
  servers[serverKey].bind({
    address: "0.0.0.0",
    port,
    exclusive: false,
  });

  servers[serverKey].on("error", (err) => {
    console.error(`server error:\n${err.stack}`);
    servers[serverKey].close();
  });

  servers[serverKey].on("message", (msg, rinfo) => {
    try {
      const json = JSON.parse(msg);

      console.log("[server]:", serverKey, json);

      if (json.type === "chat") {
        const { user_id, message, created_at, updated_at } = json;
        const roomId = sqlite
          .prepare(`select id from room where address = ? and port = ?;`)
          .get(...serverKey.split(":")).id;
        const existingChat = sqlite
          .prepare(
            `select * from chat where user_id = ? and room_id = ? and message = ? and created_at = ? and updated_at = ?;`
          )
          .get(user_id, roomId, message, created_at, updated_at);

        if (!existingChat) {
          sqlite
            .prepare(
              `insert into chat (id, user_id, room_id, message) values (?, ?, ?, ?);`
            )
            .run(v4(), user_id, roomId, message);

          const allChats = sqlite
            .prepare(`select * from chat order by created_at desc;`)
            .all();

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "chat:all", data: allChats }));
            }
          });
        }
      } else if (json.type === "chat:update") {
        const { id, message } = json;
        sqlite
          .prepare(`update chat set message = ? where id = ?;`)
          .run(message, id);
      } else if (json.type === "chat:delete") {
        const { id } = json;
        sqlite.prepare(`delete from chat where id = ?;`).run(id);
      } else if (json.type === "user") {
        const { username } = json;
        sqlite
          .prepare(
            `insert into users (id, username, address) values (?, ?, ?);`
          )
          .run(v4(), username, rinfo.address);
      } else if (json.type === "user:update") {
        const { username } = json;
        sqlite
          .prepare(`update users set username = ? where address = ?;`)
          .run(username, rinfo.address);
      } else if (json.type === "user:delete") {
        const { username } = json;
        sqlite
          .prepare(`delete from users where username = ? and address = ?;`)
          .run(username, rinfo.address);
      } else if (
        json.address !== defaultServerAddress &&
        json.port !== defaultServerPort &&
        json.type === "room"
      ) {
        const { user_id, user_ids, name, address, port } = json;

        const room = sqlite
          .prepare(`select * from room where address = ? and port = ?;`)
          .get(address, port);

        if (!room) {
          sqlite
            .prepare(
              `insert into room (id, user_id, user_ids, name, address, port) values (?, ?, ?, ?, ?, ?);`
            )
            .run(v4(), user_id, user_ids, name, address, port);

          setupServer(address, port);

          const rooms = sqlite.prepare(`select * from room order by created_at asc;`).all();

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "room:all", data: rooms }));
            }
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  servers[serverKey].on("listening", () => {
    servers[serverKey].setBroadcast(true);
    servers[serverKey].setMulticastTTL(128);
    servers[serverKey].addMembership(address, "0.0.0.0");

    console.log(`[server]: Server running at ${address}:${port}`);
  });

  console.log("[MultiChat]: done");
}

process.on("SIGINT", () => {
  process.exit();
});

process.on("SIGTERM", () => {
  process.exit();
});

process.on("exit", () => {
  console.log("[MultiChat]: Shutting down...");

  wss.terminate();

  for (const serverKey in servers) {
    servers[serverKey].close();
  }

  sqlite.close();

  console.log("[MultiChat]: done");
});

setupDb();
setupWss();
setupServer();

const rooms = sqlite.prepare(`select * from room;`).all();

for (const room of rooms) {
  setupServer(room.address, room.port);
}
