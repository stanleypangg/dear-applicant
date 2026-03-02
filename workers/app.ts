import { createRequestHandler } from "react-router";
import { syncSimplifyJobs } from "../app/lib/sync-jobs";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      syncSimplifyJobs().then((result) => {
        if (result.error) {
          console.error("[sync-jobs] Failed:", result.error);
        } else {
          console.log(`[sync-jobs] Synced ${result.synced} listings`);
        }
      })
    );
  },
} satisfies ExportedHandler<Env>;
