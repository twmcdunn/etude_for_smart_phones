import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const https = require('https');
const fs = require('fs');
//var WebSocketServer = require('ws');
import { WebSocketServer } from "ws";

import { WebSocket } from "ws";
var Websocket = require('ws').server;



const server = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}, (req, res) => {
    //res.writeHead(200);
    //res.end('hello world\n');
}).listen(8080);

const wss = new WebSocket.Server({  server });

wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", (message) => {
        console.log("Received:", message);
        //ws.send("Hello from server!");
    });
    // handling what to do when clients disconnects from server
    ws.on("close", () => {
        //Console.log("the client has disconnected");
    });
    // handling client connection error
    ws.onerror = function () {
        //Console.log("Some Error occurred")
    }
});

//onst socket = new WebSocket('wss://10.0.0.170:8080');
