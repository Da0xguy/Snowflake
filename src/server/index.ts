import { z } from 'zod';
import { publicProcedure, router } from './trpc';



const appRouter = router({
    createUpgrade: publicProcedure
        .input(z.object({ walletAddress: z.string() }))
        .mutation(async (opts) => {
            const { input } = opts;

            const upgrade = { level: 4, id: '0x1234' };

            return upgrade
        }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
export { appRouter };