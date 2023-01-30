const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const mysql = require("mysql2");

// Expressの利用
const app = http.createServer(app);
app.use(express.json());

// サーバー立ち上げ
const server = http.createServer(app);

// 3001ポートで待ち受け
server.listen(3001, () => {
  console.log("listening on port 3001");
});

// MYSQLデータベース設定
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "chatapp2"
});

// MYSQL接続
connection.connect((err) => {
  if (err) {
    console.log(err.stack);
  }
  console.log("db connect!!");
});

// ブロードキャスト設定
const wss = new WebSocket.Server({ server: server });
wss.broadcast = function(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// クライアント接続時の処理
wss.on("connection", (ws) => {
  connection.query("SELECT * FROM chat",
  (err, results) => {
    const data = {
      type: "init",
      comments: results
    };
    ws.send(JSON.stringify(data));
  });
});

// POSTリクエスト VALUESを追加する必要あり。)
app.post("/api/comments", (req, res) => {
  console.log("post request");
  connection.query(
    "INSERT INTO chat VALUES (0, ?)",[req.body.text],
    (error, results) => {
      const comments = { text: req.body.text };
      const data = {
        type: "comments",
        comments: comments
      };
      wss.broadcast(JSON.stringify(data));
    }
  );
});

// GETリクエスト
app.get("/api/comments", (req, res) => {
  console.log(("get request"));
  connection.query("SELECT * FROM chat",
  (error, results) => {
    console.log(results);
    res.send(results);
  });
});
