/* eslint-disable */
import type { AnyRouter } from "@trpc/server";
import type { AstroIntegration } from "astro";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import chalk from "chalk";
import { WebSocketServer } from "ws";

function timeNow() {
	return new Date().toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

const infoLog = (msg: string) =>
	console.info(
		`${chalk.dim(timeNow())} ${chalk.bold.cyan("[rpc/ws]")} ${msg}`
	);

const errorLog = (msg: string) =>
	console.info(
		`${chalk.dim(timeNow())} ${chalk.bold.red(
			"[rpc/ws]"
		)} ${chalk.bold.redBright(msg)}`
	);

let wss: WebSocketServer;
let created = false;
let destroyed = false;
let handler: any;

type WSConfig = {
	routerName: string;
	createContextName: string;
	routerFilePath: string;
	port: number;
};
const config: (cfg: WSConfig) => AstroIntegration = cfg => ({
	name: "@astroshuttle/rpc-dev-socket",
	hooks: {
		"astro:config:setup": async config => {
			if (config.command === "dev") {
				if (!config.config.vite.plugins) {
					config.config.vite.plugins = [];
				}

				config.config.vite.plugins?.push({
					name: "socket-hmr",
					handleHotUpdate: async ctx => {
						infoLog("Rebuilding HMR...");

						const router = await ctx.server.ssrLoadModule(
							// "src/backend/integrations/socketRouter.ts",
							cfg.routerFilePath,
							{
								fixStacktrace: true,
							}
						);

						wss?.removeAllListeners();

						handler = applyWSSHandler({
							wss,
							router: router[cfg.routerName] as AnyRouter,
							createContext: router[cfg.createContextName],
						});
						infoLog("Rebuild done.");
					},
				});
			}
		},
		"astro:config:done": async ({ config, setAdapter }) => {
			// setAdapter({
			//   name: "@astroshuttle/ws-adapter",
			//   serverEntrypoint: "@astroshuttle/rpc-ws/ssr",
			//   exports: ["socketRouter", "socketContext"]
			// })
		},
		"astro:server:setup": async options => {
			if (!created) {
				created = true;
				wss = new WebSocketServer({
					host: "0.0.0.0",
					port: cfg.port,
				});

				const prefix = `  ${chalk.dim("┃")}`;
				setTimeout(
					() =>
						console.log(
							`${prefix} RPC      ${chalk.bold.cyan(
								`http://localhost:${cfg.port}/`
							)}\n${prefix} Socket`
						),
					200
				);

				infoLog("Loading RPC-Router module...");
				const router = await options.server.ssrLoadModule(
					cfg.routerFilePath,
					{
						fixStacktrace: true,
					}
				);

				handler = applyWSSHandler({
					onError: err => {
						console.error(err);
						errorLog("Error on RPC-Router WebSocket.");
					},
					wss,
					router: router.socketRouter as AnyRouter,
					createContext: router.socketContext,
				});
				infoLog("RPC-Router module loaded.");

				wss.on("connection", ws => {
					infoLog(`Client connected [total: ${wss.clients.size}]`);
					ws.once("close", () => {
						infoLog(
							`Client disconnected [total: ${wss.clients.size}]`
						);
					});
				});
			}
		},
		"astro:server:done": () => {
			infoLog("Closing WebSocket...");
			handler?.broadcastReconnectNotification();
			wss.close();
			infoLog("WebSocket closed.");
			destroyed = true;
			created = false;
		},
	},
});

export const tRPCDevSocket = config;
