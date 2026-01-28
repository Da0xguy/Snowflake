"use client";
import { useState } from "react";
import {
  Snowflake,
  Wallet,
  CheckCircle,
  Loader2,
  Sparkles,
  Share2,
  Download,
  Compass,
  Pickaxe,
  PieChart
} from "lucide-react";
import HeroPic from "./assets/heropic.png"
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { trpc } from "./client";

type Identity = "Explorer" | "Builder" | "Staker";
type Step =
  | "stamp"
  | "transactions"
  | "defi"
  | "finalizing"
  | "done";

/* ---------------- MOCK CONTRACT READ ---------------- */
async function readUserProfileFromContract(
  wallet: string,
  identity: string
) {
  await new Promise((r) => setTimeout(r, 1200));

  return {
    identity,
    level: Math.floor(Math.random() * 4) + 1,
  };
}

/* ---------------- DELAY HELPER ---------------- */
function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export default function App() {
  // const [wallet, setWallet] = useState<string | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const currentAccount = useCurrentAccount();
  const wallet = currentAccount?.address

  const [snowflakes, setSnowflakes] = useState(
    Array.from({ length: 25 }).map(() => ({
      id: Math.random().toString(36).slice(2, 9),
      left: Math.random() * 100,
      size: 12 + Math.random() * 12,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10,
    }))
  );


  /* ---------------- STAMP FLOW ---------------- */
  async function startStamping(type: Identity) {
    setIdentity(type);
    setCurrentStep("stamp");

    await delay(1000);
    const upgrade = await trpc.createUpgrade.mutate({ walletAddress: wallet! })
    console.log("Upgrade: ", upgrade)
    setCurrentStep("transactions");

    await delay(5200);
    setCurrentStep("defi");

    await delay(5200);
    setCurrentStep("finalizing");

    await delay(5000);
    setLevel(Math.floor(Math.random() * 4) + 1);
    setCurrentStep("done");
  }

  /* ---------------- SHARE ---------------- */
  function shareNFT() {
    const image = `/nft/${identity?.toLowerCase()}_level_${level}.png`;
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
    const link = document.createElement("a");
    link.href = `/nft/${identity?.toLowerCase()}_level_${level}.png`;
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
              <p className="text-blue-200 text-lg">
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
              <StepCard title="Connect" desc="Link your wallet" />
              <StepCard title="Stamp Identity" desc="Choose your path" />
              <StepCard
                title="Verify Activity"
                desc="We read your on-chain behavior"
              />
              <StepCard
                title="NFT Evolves"
                desc="Your Yeti grows as you do"
              />
            </div>
          </div>

          {/* ABOUT */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Why SnowFlake?</h2>
            <p className="text-blue-200 max-w-3xl">
              Wallets don’t tell stories. Activity does. Yeti Identity turns
              transactions, DeFi usage, and protocol interaction into a living
              NFT that represents who you are on-chain — not who you say you
              are.
            </p>
          </div>
        </section>
      )}

      {/* ---------------- IDENTITY SELECTION ---------------- */}
      {wallet && !identity && (
        <section className="max-w-2xl mx-auto px-8 py-24 text-center space-y-10 relative z-10">
          <h2 className="text-3xl font-bold">Stamp Your Identity</h2>
          <p className="text-blue-200">
            Choose the path that best represents how you interact on-chain.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {(["Explorer", "Builder", "Staker"] as Identity[]).map((type) => (
              <button
                key={type}
                onClick={() => startStamping(type)}
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

      {/* ---------------- STAMPING PROCESS ---------------- */}
      {identity && currentStep && currentStep !== "done" && (
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


      {/* ---------------- NFT RESULT ---------------- */}
      {currentStep === "done" && identity && level && (
        <section className="max-w-xl mx-auto px-8 py-24 text-center space-y-8 relative z-10">
          <img
            src={`/nft/${identity.toLowerCase()}_level_${level}.png`}
            className="w-72 mx-auto rounded-3xl shadow-2xl"
          />

          <h2 className="text-3xl font-bold">
            {identity} Yeti — Level {level}
          </h2>

          <p className="text-blue-200">
            Your NFT will continue evolving as your on-chain activity grows.
          </p>

          <div className="flex justify-center gap-4 mt-4">
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
function StepCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="font-bold mb-2">{title}</div>
      <div className="text-blue-300 text-sm">{desc}</div>
    </div>
  );
}

function ProgressItem({
  text,
  done,
  active,
}: {
  text: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 justify-center text-sm">
      {done ? (
        <CheckCircle className="text-green-400" size={18} />
      ) : active ? (
        <Loader2 className="animate-spin text-cyan-400" size={18} />
      ) : (
        <div className="w-4 h-4 rounded-full border border-white/30" />
      )}
      <span className={done ? "text-green-300" : "text-blue-200"}>{text}</span>
    </div>
  );
}
