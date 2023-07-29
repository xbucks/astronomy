import { createTRPCProxyClient, createWSClient, wsLink } from "@trpc/client";
import type { SocketRouter } from "../backend/router";
import superjson from "superjson";

// // @ts-ignore
// export const client = generateRPCClient<SocketRouter, SocketRouter>({
// 	socketURL: "",
// 	transformer: superjson,
// });

export const client = createTRPCProxyClient<SocketRouter>({
	transformer: superjson,
	links: [
		wsLink({
			client: createWSClient({
				url: `${
					window.location.protocol === "https:" ? "wss" : "ws"
				}://${location.hostname}:8443/api/trpc`,
			}),
		}),
	],
});

// export const useQuery = client.useQuery;
// export const useMutation = client.useMutation;
// export const runQuery = client.runQueryAndThrow;
// export const runMutation = client.runMutationAndThrow;
// export const subscribe = client.subscribe;
