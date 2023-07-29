// Helper for API endpoints

export function rmsg(message: string, code = 200) {
	return new Response(JSON.stringify({ message }), { status: code });
}

export function rdata(data: any, code = 200) {
	return new Response(JSON.stringify(data), { status: code });
}

// response fuck you (please log in)
export function rfu(
	message = "That action requires an account",
	code: 401 | 403 = 401
) {
	return rmsg(message, code);
}
