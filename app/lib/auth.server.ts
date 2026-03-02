import { redirect } from "react-router";
import { auth } from "~/lib/auth";

export async function getRequiredSession(request: Request) {
	const session = await auth.api.getSession({
		headers: request.headers,
	});
	if (!session) {
		throw redirect("/login");
	}
	return session;
}

export async function getOptionalSession(request: Request) {
	return auth.api.getSession({
		headers: request.headers,
	});
}
