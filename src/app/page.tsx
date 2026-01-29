"use client";
import { useState, useEffect } from "react";
import {
  Snowflake,
  CheckCircle,
  Loader2,
  Sparkles,
  Share2,
  Download,
  Compass,
  Pickaxe,
  PieChart,
  Home
} from "lucide-react";
import HeroPic from "../assets/heropic.png"
import { ConnectButton, useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { trpc } from "../client";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, YETI_TYPE, REGISTRY_ID, AVAILABLE_LEVELS, type Identity } from "../constants";

// Helper to resolve the correct image (handling missing levels)
function getYetiImage(identity: Identity, level: number): string {
  const levels = AVAILABLE_LEVELS[identity];
  if (!levels) return ""; // Should not happen

  // Find exact match
  if (levels.includes(level)) {
    return `/nft/${identity.toLowerCase()}_level_${level}.png`;
  }

  // Fallback to the highest available level <= requested level
  // Since levels are sorted (assumed from the constant), valid levels are those mapping to available images.
  // Actually the logic for finding fallback:
  const sorted = [...levels].sort((a, b) => a - b);
  const fallback = sorted.reverse().find(l => l <= level) || sorted[sorted.length - 1]; // fallback to lowest if nothing found (unlikely as 1 is usually there)

  return `/nft/${identity.toLowerCase()}_level_${fallback}.png`;
}
type Step =
  | "stamp"
  | "minting"
  | "transactions"
  | "defi"
  | "finalizing"
  | "upgrade-available"
  | "upgrading"
  | "insufficient-points"
  | "error" // New step
  | "done";

/* ---------------- MOCK CONTRACT READ ---------------- */
// async function readUserProfileFromContract(
//   wallet: string,
//   identity: string
// ) {
//   await new Promise((r) => setTimeout(r, 1200));

//   return {
//     identity,
//     level: Math.floor(Math.random() * 4) + 1,
//   };
// }

/* ---------------- DELAY HELPER ---------------- */
function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function useUserYeti(address?: string) {
  return useSuiClientQuery("getOwnedObjects", {
    owner: address!,
    filter: { StructType: YETI_TYPE },
    options: { showContent: true },
  }, {
    enabled: !!address
  });
}

export default function Page() {
  // const [wallet, setWallet] = useState<string | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);

  const [scoreData, setScoreData] = useState<{ score: number; txCount: number; protocolCount: number } | null>(null);

  const [upgradeId, setUpgradeId] = useState<string | null>(null);
  const [previousAction, setPreviousAction] = useState<"mint" | "upgrade" | null>(null);
  const currentAccount = useCurrentAccount();
  const wallet = currentAccount?.address
  const { data: userYeti, refetch: refetchYeti } = useUserYeti(wallet);
  console.log("Yeti Nft :", userYeti)
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const yetiContent = userYeti?.data?.[0]?.data?.content;
  const currentLevel = yetiContent?.dataType === "moveObject" ? (yetiContent.fields as any)?.level : undefined;
  const currentIdentity = yetiContent?.dataType === "moveObject" ? (yetiContent.fields as any)?.identity : undefined;

  // Debugging logs
  console.log("Render State:", {
    currentStep,
    identity,
    level,
    previousAction,
    currentLevel,
    currentIdentity
  });

  const [snowflakes, setSnowflakes] = useState<{ id: string; left: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    setSnowflakes(
      Array.from({ length: 25 }).map(() => ({
        id: Math.random().toString(36).slice(2, 9),
        left: Math.random() * 100,
        size: 12 + Math.random() * 12,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 10,
      }))
    );
  }, []);



  /* ---------------- MINT FLOW (New Users) ---------------- */
  function handleMint(type: Identity) {
    if (!wallet || !REGISTRY_ID) return;
    setIdentity(type);
    setCurrentStep("minting");

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::showflake::mint_and_send`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.address(wallet!)
      ]
    });

    signAndExecuteTransaction({
      transaction: tx,
    }, {
      onSuccess: (result) => {
        console.log("Mint success:", result);
        // In a real app, invalidating query to refetch userYeti would happen here
        setLevel(1);
        setPreviousAction("mint");
        setCurrentStep("done");
      },
      onError: (error) => {
        console.error("Mint failed:", error);
        setCurrentStep("error");
      }
    });
  }

  /* ---------------- UPGRADE FLOW (Existing Users) ---------------- */
  async function startUpgradeFlow() {
    // Only existing users enter here
    setCurrentStep("stamp");

    await delay(1000);
    const upgrade = await trpc.createUpgrade.mutate({ walletAddress: wallet! })
    console.log("Upgrade response: ", upgrade)

    if (upgrade.status === 'insufficient_points') {
      setScoreData({
        score: upgrade.score!, // Force unwrap as we know it exists for this status
        txCount: upgrade.txCount!,
        protocolCount: upgrade.protocolCount!
      });
      setCurrentStep("insufficient-points");
      return;
    }

    if (upgrade.status === 'success' && upgrade.id) {
      setUpgradeId(upgrade.id);
      setCurrentStep("upgrade-available");
      return;
    }

    setCurrentStep("transactions");

    await delay(5200);
    setCurrentStep("defi");

    await delay(5200);
    setCurrentStep("finalizing");

    await delay(5000);
    setLevel(Math.floor(Math.random() * 4) + 1);
    setCurrentStep("done");
  }

  // /* ---------------- STAMP FLOW ---------------- */
  // async function startStamping(type: Identity) {

  //   setIdentity(type);
  //   setCurrentStep("stamp");

  //   await delay(1000);
  //   const upgrade = await trpc.createUpgrade.mutate({ walletAddress: wallet! })
  //   console.log("Upgrade: ", upgrade)

  //   if (upgrade && upgrade.id) {
  //     setUpgradeId(upgrade.id);
  //     setCurrentStep("upgrade-available");
  //     return;
  //   }

  //   setCurrentStep("transactions");

  //   await delay(5200);
  //   setCurrentStep("defi");

  //   await delay(5200);
  //   setCurrentStep("finalizing");

  //   await delay(5000);
  //   setLevel(Math.floor(Math.random() * 4) + 1);
  //   setCurrentStep("done");
  // }

  function handleUpgrade() {
    if (!upgradeId || !wallet || !userYeti?.data?.[0]?.data?.objectId) return;

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::showflake::upgrade_yeti`,
      arguments: [
        tx.object(userYeti.data[0].data.objectId), // Yeti Object
        tx.object(upgradeId) // YetiUpgrade Object from backend
      ]
    });

    setCurrentStep("upgrading");

    signAndExecuteTransaction({
      transaction: tx,
    }, {
      onSuccess: (result) => {
        console.log("Upgrade success:", result);
        // Optimistic update or refetch could happen here
        setLevel(4); // Mock level update
        setPreviousAction("upgrade");
        setCurrentStep("done");
      },
      onError: (error) => {
        console.error("Upgrade failed:", error);
        setCurrentStep("error");
      }
    });
  }

  /* ---------------- SHARE ---------------- */
  function shareNFT() {
    if (!identity || !level) return;
    const image = getYetiImage(identity, level);
    if (navigator.share) {
      navigator.share({
        title: "My Yeti Identity",
        text: `I unlocked a ${identity} Yeti (Level ${level}) 🧊`,
        url: window.location.origin + image,
      });
    } else {
      window.open(image, "_blank");
    }
  }

  function AnimatedProgress({
    text,
    done,
    active,
    show,
    delay = 0,
  }: {
    text: string;
    done?: boolean;
    active?: boolean;
    show: boolean;
    delay?: number;
  }) {
    if (!show) return null;

    return (
      <div
        className="flex items-center gap-3 text-sm opacity-0 animate-stepIn"
        style={{ animationDelay: `${delay}ms` }}
      >
        {done ? (
          <CheckCircle className="text-green-400" size={18} />
        ) : active ? (
          <Loader2 className="animate-spin text-cyan-400" size={18} />
        ) : (
          <div className="w-4 h-4 rounded-full border border-white/30" />
        )}

        <span
          className={
            done
              ? "text-green-300"
              : active
                ? "text-cyan-300"
                : "text-blue-200"
          }
        >
          {text}
        </span>
      </div>
    );
  }

  function downloadNFT() {
    if (!identity || !level) return;
    const link = document.createElement("a");
    link.href = getYetiImage(identity, level);
    link.download = "yeti-identity.png";
    link.click();
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-black text-white overflow-hidden">
      {/* ---------------- SNOWFLAKES BACKGROUND ---------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {snowflakes.map((s) => (
          <Snowflake
            key={s.id}
            size={s.size}
            className="text-white/20 absolute"
            style={{
              left: `${s.left}%`,
              top: "-2rem",
              animation: `fall ${s.duration}s linear ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ---------------- NAV ---------------- */}
      <nav className="flex justify-between items-center px-8 py-6 relative z-10">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Snowflake className="text-cyan-300" />
          SnowFlake
        </div>

        {!wallet && (
          <ConnectButton className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 transition" />
          //  <Wallet size={18} />
          //  Connect Wallet
          //</ConnectButton>
          // <button
          //   onClick={() => alert("you click a button")}
          //   className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 transition"
          // >
          //   <Wallet size={18} />
          //   Connect Wallet
          // </button>
        )}
      </nav>

      {/* ---------------- LANDING ---------------- */}
      {!wallet && (
        <section className="max-w-6xl mx-auto px-8 py-24 space-y-24 min-h-screen relative z-10">
          {/* HERO */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl font-extrabold leading-tight">
                Your On-Chain Identity,
                <span className="text-cyan-400"> Earned</span>
              </h1>
              <p className="text-blue-200 text-lg animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
                Yeti Identity NFTs evolve based on what you actually do on-chain.
                No quizzes. No forms. Just real activity.
              </p>
            </div>

            <img
              src={HeroPic.src}
              className="w-72 mx-auto rounded-3xl shadow-2xl animate-float"
            />
          </div>

          {/* STEPS */}
          <div>
            <h2 className="text-3xl font-bold mb-8">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <StepCard title="Connect" desc="Link your wallet" delay={0.3} />
              <StepCard title="Stamp Identity" desc="Choose your path" delay={0.4} />
              <StepCard
                title="Verify Activity"
                desc="We read your on-chain behavior"
                delay={0.5}
              />
              <StepCard
                title="NFT Evolves"
                desc="Your Yeti grows as you do"
                delay={0.6}
              />
            </div>
          </div>

          {/* ABOUT */}
          <div>
            <h2 className="text-3xl font-bold mb-6 animate-fadeInUp" style={{ animationDelay: "0.8s" }}>Why SnowFlake?</h2>
            <p className="text-blue-200 max-w-3xl animate-fadeInUp" style={{ animationDelay: "0.9s" }}>
              Wallets don’t tell stories. Activity does. Yeti Identity turns
              transactions, DeFi usage, and protocol interaction into a living
              NFT that represents who you are on-chain — not who you say you
              are.
            </p>
          </div>
        </section>
      )}


      {/* ---------------- NEW USER ONBOARDING (MINT) ---------------- */}
      {wallet && !identity && (!userYeti?.data || userYeti.data.length === 0) && (
        <section className="max-w-2xl mx-auto px-8 py-24 text-center space-y-10 relative z-10">
          <h2 className="text-3xl font-bold">Mint Your First Yeti</h2>
          <p className="text-blue-200">
            Choose your path to mint your identity NFT on-chain.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {(["Explorer", "Builder", "Staker"] as Identity[]).map((type) => (
              <button
                key={type}
                onClick={() => handleMint(type)}
                className="p-6 rounded-2xl bg-white/5 border border-white/20 hover:bg-white/10 hover:scale-105 transition"
              >
                <div className="text-xl font-bold">{type}</div>
                <div className="text-xs text-blue-300 mt-2 flex items-center justify-center gap-1">
                  {type === "Explorer" && (
                    <>
                      <Compass size={30} />
                      Transactions & usage
                    </>
                  )}
                  {type === "Builder" && (
                    <>
                      <Pickaxe size={30} />
                      Contracts & deployments
                    </>
                  )}
                  {type === "Staker" && (
                    <>
                      <PieChart size={30} />
                      Liquidity & staking
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- EXISTING USER DASHBOARD (UPGRADE) ---------------- */}
      {wallet && userYeti?.data && userYeti.data.length > 0 && !currentStep && (
        <section className="max-w-2xl mx-auto px-8 py-24 text-center space-y-10 relative z-10">
          <h2 className="text-3xl font-bold">Welcome Back, Yeti!</h2>
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl animate-cardIn">
            <img src={getYetiImage(currentIdentity as Identity || "Explorer", (currentLevel as number) || 1)} className="w-48 mx-auto rounded-xl mb-6 shadow-lg" />
            <p className="text-blue-200 mb-6">
              You have a Level {currentLevel} Yeti. Check if you are eligible for an upgrade based on your recent activity.
            </p>
            <button
              onClick={startUpgradeFlow}
              className="px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold transition flex items-center justify-center gap-2 mx-auto"
            >
              <Sparkles size={20} />
              Check for Upgrades
            </button>
          </div>
        </section>
      )}

      {/* ---------------- MINTING STATE ---------------- */}
      {currentStep === "minting" && (
        <section className="max-w-xl mx-auto px-4 sm:px-8 py-24 relative z-10 text-center">
          <div className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8 sm:p-10 space-y-8 animate-cardIn">
            <Loader2 className="mx-auto animate-spin text-cyan-400" size={42} />
            <h3 className="text-2xl font-bold">Minting Your Yeti...</h3>
            <p className="text-blue-200">Please approve the transaction in your wallet.</p>
          </div>
        </section>
      )}

      {currentStep && currentStep !== "done" && currentStep !== "upgrade-available" && currentStep !== "upgrading" && currentStep !== "minting" && currentStep !== "insufficient-points" && currentStep !== "error" && (
        <section className="max-w-xl mx-auto px-4 sm:px-8 py-24 relative z-10">
          <div className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8 sm:p-10 space-y-8 animate-cardIn">

            {/* Header */}
            <div className="text-center space-y-4">
              <Loader2
                className="mx-auto animate-spin text-cyan-400"
                size={42}
              />
              <h3 className="text-2xl font-bold tracking-wide">
                Stamping Identity
              </h3>
              <p className="text-sm text-blue-300">
                Reading your on-chain footprint 🧊
              </p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-4">
              <AnimatedProgress
                show={true}
                done={currentStep !== "stamp"}
                text="Stamping chosen identity"
                delay={0}
              />

              <AnimatedProgress
                show={currentStep !== "stamp"}
                done={currentStep === "defi" || currentStep === "finalizing"}
                text="Checking transaction history"
                delay={150}
              />

              <AnimatedProgress
                show={currentStep === "defi" || currentStep === "finalizing"}
                done={currentStep === "finalizing"}
                text="Analyzing DeFi & protocol interactions"
                delay={300}
              />

              <AnimatedProgress
                show={currentStep === "finalizing"}
                active={currentStep === "finalizing"}
                text="Finalizing Yeti level"
                delay={450}
              />
            </div>
          </div>
        </section>
      )}

      {/* ---------------- INSUFFICIENT POINTS UI ---------------- */}
      {currentStep === "insufficient-points" && scoreData && (
        <section className="max-w-xl mx-auto px-4 sm:px-8 py-24 relative z-10 text-center">
          <div className="relative rounded-3xl bg-red-500/10 backdrop-blur-xl border border-red-500/30 shadow-2xl p-8 sm:p-10 space-y-6 animate-cardIn">
            <h3 className="text-3xl font-bold text-red-400">Upgrade Locked</h3>
            <p className="text-blue-200">
              You need more on-chain activity to evolve your Yeti.
            </p>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-left space-y-2">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Current Score:</span>
                <span className={scoreData.score >= 30 ? "text-green-400" : "text-red-400"}>{scoreData.score} / 30</span>
              </div>
              <hr className="border-white/10 my-2" />
              <div className="flex justify-between items-center text-sm text-blue-300">
                <span>Transactions ({scoreData.txCount}):</span>
                <span>+{Math.floor(scoreData.txCount / 10) * 2} pts</span>
              </div>
              <div className="flex justify-between items-center text-sm text-blue-300">
                <span>Unique Protocols ({scoreData.protocolCount}):</span>
                <span>+{scoreData.protocolCount * 5} pts</span>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => setCurrentStep(null)}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- UPGRADE PROMPT ---------------- */}

      {/* ---------------- ERROR STATE ---------------- */}
      {currentStep === "error" && (
        <TransactionFailed
          onRetry={() => {
            if (upgradeId) {
              handleUpgrade();
            } else if (identity) {
              handleMint(identity);
            }
          }}
          onClose={() => setCurrentStep(null)}
        />
      )}
      {currentStep === "upgrade-available" && (
        <section className="max-w-xl mx-auto px-4 sm:px-8 py-24 relative z-10 text-center">
          <div className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8 sm:p-10 space-y-8 animate-cardIn">
            <h3 className="text-3xl font-bold">Upgrade Available!</h3>
            <p className="text-blue-200">
              Your on-chain activity qualifies you for a Level {currentLevel} Yeti Upgrade.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleUpgrade}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-bold transition flex items-center gap-2"
              >
                <Sparkles size={20} />
                Upgrade Now
              </button>
              <button
                onClick={() => setCurrentStep("transactions")}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
              >
                Skip
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- UPGRADING STATE ---------------- */}
      {currentStep === "upgrading" && (
        <section className="max-w-xl mx-auto px-4 sm:px-8 py-24 relative z-10 text-center">
          <div className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8 sm:p-10 space-y-8 animate-cardIn">
            <Loader2 className="mx-auto animate-spin text-cyan-400" size={42} />
            <h3 className="text-2xl font-bold">Applying Upgrade...</h3>
            <p className="text-blue-200">Please approve the transaction in your wallet.</p>
          </div>
        </section>
      )}


      {/* ---------------- NFT RESULT ---------------- */}
      {/* ---------------- NFT RESULT ---------------- */}
      {currentStep === "done" && (identity || currentIdentity) && level && (
        <section className="max-w-xl mx-auto px-8 py-24 text-center space-y-8 relative z-10">
          <img
            src={getYetiImage((identity || currentIdentity) as Identity, level)}
            className="w-72 mx-auto rounded-3xl shadow-2xl"
          />

          <h2 className="text-3xl font-bold">
            {previousAction === "upgrade" ? "Upgrade Successful!" : `${identity || currentIdentity} Yeti Minted!`}
          </h2>
          <p className="text-xl text-cyan-300 font-semibold">
            Level {level} Unlocked
          </p>

          <p className="text-blue-200">
            Your NFT will continue evolving as your on-chain activity grows.
          </p>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={async () => {
                await refetchYeti();
                setCurrentStep(null);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20"
            >
              <Home size={18} />
              Home
            </button>
            <button
              onClick={shareNFT}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500"
            >
              <Share2 size={18} />
              Share
            </button>
            <button
              onClick={downloadNFT}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20"
            >
              <Download size={18} />
              Download
            </button>
          </div>
        </section>
      )}

      {/* ---------------- ANIMATIONS ---------------- */}
      <style >{`
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */
function StepCard({ title, desc, delay = 0 }: { title: string; desc: string; delay?: number }) {
  return (
    <div
      className="p-6 rounded-2xl bg-white/5 border border-white/10 opacity-0 animate-fadeInUp"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="font-bold mb-2">{title}</div>
      <div className="text-blue-300 text-sm">{desc}</div>
    </div>
  );
}

function TransactionFailed({
  onRetry,
  onClose,
}: {
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <section className="max-w-xl mx-auto px-4 sm:px-8 py-24 relative z-10 text-center">
      <div className="relative rounded-3xl bg-red-500/10 backdrop-blur-xl border border-red-500/30 shadow-2xl p-8 sm:p-10 space-y-6 animate-cardIn">
        <h3 className="text-3xl font-bold text-red-400">Transaction Failed</h3>
        <p className="text-blue-200">
          Something went wrong while processing your transaction. Please check your
          wallet and try again.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={onRetry}
            className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 transition font-semibold"
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </section>
  );
}
