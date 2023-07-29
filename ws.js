import { socketContext, socketRouter } from "./prod-ws/router.js";

import { WebSocketServer } from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import https from "https";
import { readFileSync } from "fs";

const httpsServer = https.createServer({
	key: readFileSync("key.pem"),
	cert: readFileSync("cert.pem"),
});

const wss = new WebSocketServer({ server: httpsServer });
applyWSSHandler({
	wss,
	router: socketRouter,
	createContext: socketContext,
});

httpsServer.listen(8443, () => {
	console.log("Websocket server is up.");
});
