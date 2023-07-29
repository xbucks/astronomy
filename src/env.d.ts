/// <reference types="astro/client" />

type AuthRequest = import("./helper/auth").AuthRequest;

declare namespace App {
	interface Locals {
		auth: AuthRequest;
	}
}
