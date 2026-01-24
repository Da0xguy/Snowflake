import React, { useState } from 'react';
import { Snowflake, Footprints, Mountain, Sparkles, Pickaxe, Telescope, Calendars, BadgeCheck } from 'lucide-react';

const YetiStampDApp = () => {
  const [wallet, setWallet] = useState(null);
  const [stamp, setStamp] = useState(null);
  const [isStamping, setIsStamping] = useState(false);
  const [selectedType, setSelectedType] = useState('Explorer');

  // Simulated wallet connection
  const connectWallet = async () => {
    setIsStamping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setWallet('0x' + Math.random().toString(16).substr(2, 40));
    setIsStamping(false);
  };

  // Simulated stamp minting
  const mintStamp = async () => {
    if (!wallet) return;
    
    setIsStamping(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStamp({
      type: selectedType,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    });
    
    setIsStamping(false);
  };

  const stampTypes = [
    { name: 'Hackathon', icon: <Calendars className="text-white" size={36} />, color: 'from-blue-500 to-cyan-500' },
    { name: 'Builder', icon: <Pickaxe className="text-white" size={36} />, color: 'from-purple-500 to-pink-500' },
    { name: 'Explorer', icon: <Telescope className="text-white" size={36} />, color: 'from-green-500 to-emerald-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          >
            <Snowflake className="text-white opacity-20" size={16 + Math.random() * 16} />
          </div>
        ))}
      </div>

      {/* Mountains background */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-blue-950 to-transparent opacity-50">
        <Mountain className="absolute bottom-0 left-10 text-blue-800 opacity-30" size={200} />
        <Mountain className="absolute bottom-0 right-20 text-blue-800 opacity-20" size={250} />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Footprints className="text-cyan-300" size={48} />
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Yeti Stamp
            </h1>
            <Snowflake className="text-cyan-300" size={48} />
          </div>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Your non-transferable proof of participation in the Yeti ecosystem
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-blue-300">
            <Sparkles size={20} />
            <span className="text-sm">Built on Sui • Powered by Move</span>
          </div>
        </header>

        {/* Main card */}
        <div className="flex-1 flex items-center justify-center pb-20">
          <div className="w-full max-w-2xl">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
              {!wallet ? (
                /* Connect Wallet State */
                <div className="text-center space-y-8">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                    <Footprints className="text-white" size={64} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-3">
                      Leave Your Mark
                    </h2>
                    <p className="text-blue-200 text-lg">
                      Connect your wallet to claim your Yeti stamp
                    </p>
                  </div>
                  <button
                    onClick={connectWallet}
                    disabled={isStamping}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isStamping ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                </div>
              ) : !stamp ? (
                /* Stamp Selection State */
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Choose Your Stamp
                    </h2>
                    <p className="text-blue-200">
                      Select the type that represents you
                    </p>
                    <p className="text-sm text-blue-300 mt-2">
                      Wallet: {wallet.slice(0, 6)}...{wallet.slice(-4)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stampTypes.map((type) => (
                      <button
                        key={type.name}
                        onClick={() => setSelectedType(type.name)}
                        className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                          selectedType === type.name
                            ? 'border-cyan-400 bg-white/20 scale-105'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex justify-center text-4xl mb-3">{type.icon}</div>
                        <div className="text-white font-bold text-lg">{type.name}</div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={mintStamp}
                    disabled={isStamping}
                    className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isStamping ? (
                      <span className="flex items-center justify-center gap-2">
                        <Snowflake className="animate-spin" size={20} />
                        Stamping Your Passport...
                      </span>
                    ) : (
                      'Stamp My Yeti Passport'
                    )}
                  </button>
                </div>
              ) : (
                /* Stamp Claimed State */
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className={`w-40 h-40 mx-auto bg-gradient-to-br ${stampTypes.find(t => t.name === stamp.type)?.color} rounded-full flex items-center justify-center animate-bounce-slow relative`}>
                      <div className="text-6xl">
                        <BadgeCheck className="text-white" size={76} />
                      </div>
                      <div className="absolute -top-2 -right-2">
                        <Sparkles className="text-yellow-300 animate-pulse" size={32} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Stamp Claimed! 
                    </h2>
                    <p className="text-blue-200 text-lg">
                      You're officially part of the Yeti ecosystem
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Stamp Type:</span>
                      <span className="text-white font-bold">{stamp.type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Timestamp:</span>
                      <span className="text-white font-mono text-sm">
                        {new Date(stamp.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Stamp ID:</span>
                      <span className="text-white font-mono text-sm">{stamp.id}</span>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                      <span className="text-blue-300 text-sm flex items-center gap-2">
                        <Footprints size={16} />
                        Non-transferable • Forever yours
                      </span>
                    </div>
                  </div>

                  <div className="text-center text-blue-300 text-sm">
                    Your footprint is now permanently recorded on Sui ⛓️
                  </div>
                </div>
              )}
            </div>

            {/* Info footer */}
            <div className="mt-8 text-center space-y-2">
              <p className="text-blue-200 text-sm">
                🐾 One stamp per wallet • Non-transferable • Permanent
              </p>
            </div>
          </div>
        </div>
      </div>

      <style tsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default YetiStampDApp;