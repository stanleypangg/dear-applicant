import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("login", "routes/login.tsx"),
	route("signup", "routes/signup.tsx"),
	route("forgot-password", "routes/forgot-password.tsx"),
	route("reset-password", "routes/reset-password.tsx"),
	route("api/auth/*", "routes/api.auth.$.tsx"),
	layout("routes/layout.auth.tsx", [
		route("dashboard", "routes/dashboard.tsx"),
		route("dashboard/columns", "routes/dashboard.columns.tsx"),
		route("dashboard/applications", "routes/dashboard.applications.tsx"),
	]),
] satisfies RouteConfig;
