import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as authSchema from "./auth-schema";
import * as appSchema from "./schema";

const schema = { ...authSchema, ...appSchema };

export const db = drizzle(env.dearapplicant, { schema });
export type Database = typeof db;
