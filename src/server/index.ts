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

            try {
                // Ensure variables are treated as strings
                const SUI_PRIVATE_KEY = process.env.SUI_PRIVATE_KEY!;
                const ADMIN_CAP_ID = process.env.ADMIN_CAP_ID!;
                
                // Use devnet as default
                const client = new SuiClient({ url: getFullnodeUrl('devnet') });

                // -------------------------------------------------------------
                // 1. Verify User Activity (Explorer Logic)
                // -------------------------------------------------------------
                console.log(`Verifying activity for ${input.walletAddress}...`);
                const history = await client.queryTransactionBlocks({
                    filter: { FromAddress: input.walletAddress },
                    limit: 50, // Analyze last 50 transactions
                    options: {
                        showInput: true,
                        showEffects: true,
                    }
                });

                const txCount = history.data.length;
                const uniquePackages = new Set<string>();

                for (const tx of history.data) {
                    const transaction = tx.transaction?.data?.transaction;
                    // Check for ProgrammableTransaction
                    if (transaction?.kind === 'ProgrammableTransaction') {
                        for (const cmd of transaction.transactions) {
                            // cmd can be { MoveCall: ... }, { TransferObjects: ... }, etc.
                            // We are looking for MoveCall to identify protocol interactions
                            if ('MoveCall' in cmd && cmd.MoveCall) {
                                const pkg = cmd.MoveCall.package;
                                // Basic filter: Ignore system packages (0x1, 0x2) and own package
                                if (pkg !== '0x0000000000000000000000000000000000000000000000000000000000000001' && 
                                    pkg !== '0x0000000000000000000000000000000000000000000000000000000000000002' && 
                                    pkg !== PACKAGE_ID) {
                                    uniquePackages.add(pkg);
                                }
                            }
                        }
                    }
                }

                const protocolPoints = uniquePackages.size * 5;
                const txPoints = Math.floor(txCount / 10) * 2;
                const totalPoints = protocolPoints + txPoints;

                console.log(`Activity Score: ${totalPoints} (Tx: ${txCount}, Protocols: ${uniquePackages.size})`);

                if (totalPoints < 30) {
                     return {
                        status: 'insufficient_points',
                        score: totalPoints,
                        txCount: txCount,
                        protocolCount: uniquePackages.size,
                        required: 30
                     };
                }

                // 2. Fetch User's Yeti to determine current level
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
                tx.moveCall({
                    target: `${PACKAGE_ID}::admin::mint_and_send`,
                    arguments: [
                        tx.object(ADMIN_CAP_ID),
                        tx.pure.address(input.walletAddress),
                        tx.pure.string(`https://assets.example.com/yeti_level_${nextLevel}.png`), 
                        tx.pure.u64(nextLevel)
                    ]
                });

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
                    status: 'success',
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