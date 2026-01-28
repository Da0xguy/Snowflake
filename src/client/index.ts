import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { AppRouter } from "../server";
import { transformer } from "../utils/transformer";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api",
      transformer,
    }),
  ],
});
