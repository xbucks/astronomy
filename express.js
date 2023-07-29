import express from "express";
import { handler } from "./prod/main/dist/server/entry.mjs";
import http from "http";
import rateLimit from "express-rate-limit";

const app = express();

const limit = (windowMs, max) =>
	rateLimit({
		windowMs,
		max,
		standardHeaders: false,
		legacyHeaders: false,
		message: JSON.stringify({
			message: "Too many requests, please try again later.",
		}),
	});

app.use("/api/users/reset", limit(1 * 1000 * 1000, 10));
app.use("/api/users/login", limit(1 * 1000 * 1000, 10));
app.use("/api/users/signup", limit(1 * 60 * 1000 * 1000, 3));
app.use("/api/users/password", limit(1 * 1000 * 1000, 10));
app.use("/api/users/resend", limit(10 * 60 * 1000, 1));

app.use("/api/search", limit(1 * 1000 * 1000, 60));

app.use("/api/gapi", limit(1 * 1000 * 1000, 1000));

app.use(express.static("img"));
app.use(express.static("dist/main/dist/client"));
app.use((req, res, next) => {
	handler(req, res, next);
});

app.set("trust proxy", 1);

app.use((req, res) => {
	req.url = "/404";
	app.handle(req, res);
});

const server = http.createServer(app);
server.listen(3000);
