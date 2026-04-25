import { createFileRoute } from '@tanstack/react-router'
import { createRouteHandler } from "uploadthing/server";
import { ourFileRouter } from "../../lib/uploadthing";
import { env } from "../../env";

const handlers = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: env.UPLOADTHING_TOKEN,
  },
});

export const Route = createFileRoute('/api/uploadthing')({
  server: {
    handlers: {
      GET: async ({ request }) => handlers(request),
      POST: async ({ request }) => handlers(request),
    }
  }
})
