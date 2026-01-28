import { z } from 'zod';
import { publicProcedure, router } from './trpc';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { PACKAGE_ID, YETI_TYPE } from '../constants';
import dotenv from 'dotenv';
dotenv.config();


const appRouter = router({
    createUpgrade: publicProcedure
        .input(z.object({ walletAddress: z.string() }))
        .mutation(async (opts) => {
            const { input } = opts; // Restore input destructuring

            if (!process.env.SUI_PRIVATE_KEY || !process.env.ADMIN_CAP_ID) {
                console.warn("Missing SUI_PRIVATE_KEY or ADMIN_CAP_ID. Returning mock data.");
                return { 
                    level: 4, 
                    id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' 
                };
            }

            try {
                const { SUI_PRIVATE_KEY, ADMIN_CAP_ID } = process.env;
                // Use devnet as default
                const client = new SuiClient({ url: getFullnodeUrl('devnet') });
                
                // 1. Fetch User's Yeti to determine current level
                const ownedObjects = await client.getOwnedObjects({
                    owner: input.walletAddress,
                    filter: { StructType: YETI_TYPE },
                    options: { showContent: true }
                });

                const yetiObj = ownedObjects.data?.[0];

                if (!yetiObj || !yetiObj.data?.content || yetiObj.data.content.dataType !== 'moveObject') {
                    throw new Error("No Yeti NFT found for this wallet. You need a Yeti to upgrade!");
                }

                // Cast fields to any to access dynamic Move struct fields
                const fields = yetiObj.data.content.fields as any;
                // Move u64 is returned as string in JSON
                const currentLevel = parseInt(fields.level, 10);
                const nextLevel = currentLevel + 1;

                console.log(`Found Yeti ${yetiObj.data.objectId} at level ${currentLevel}. Upgrading to ${nextLevel}.`);

                const keypair = Ed25519Keypair.fromSecretKey(decodeSuiPrivateKey(SUI_PRIVATE_KEY).secretKey);
                const tx = new Transaction();

                // 2. Mint Upgrade Object
                // Returns result which is the YetiUpgrade object
                const [upgradeObj] = tx.moveCall({
                    target: `${PACKAGE_ID}::admin::mint`,
                    arguments: [
                        tx.object(ADMIN_CAP_ID),
                        tx.pure.string(`https://assets.example.com/yeti_level_${nextLevel}.png`), 
                        tx.pure.u64(nextLevel)
                    ]
                });

                // 3. Transfer to User
                tx.transferObjects([upgradeObj], tx.pure.address(input.walletAddress));

                // 4. Execute with effects and object changes
                const result = await client.signAndExecuteTransaction({
                    signer: keypair,
                    transaction: tx,
                    options: {
                        showEffects: true,
                        showObjectChanges: true
                    }
                });

                // 5. Find the Created Object ID
                const createdObj = result.objectChanges?.find(
                    (change) => change.type === 'created' && change.objectType.includes('YetiUpgrade')
                );

                if (!createdObj || !('objectId' in createdObj)) {
                    throw new Error("Failed to find created upgrade object in transaction effects");
                }

                return {
                    level: nextLevel,
                    id: createdObj.objectId
                };
            } catch (e) {
                console.error("Backend minting failed:", e);
                // Fallback to error or re-throw depending on desired behavior
                throw new Error("Failed to mint upgrade on-chain: " + (e instanceof Error ? e.message : String(e)));
            }
        }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
export { appRouter };