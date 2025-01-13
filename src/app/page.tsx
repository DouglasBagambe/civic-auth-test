"use client";
import React, { useState, useEffect } from "react";
import { UserButton, useUser } from "@civic/auth-web3/react";
import {
  useConnect,
  useAccount,
  useBalance,
  useSignMessage,
  useSendTransaction,
  useDisconnect,
} from "wagmi";
import { userHasWallet } from "@civic/auth-web3";
import { parseEther } from "viem";

export default function Home() {
  const userContext = useUser();
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: signMessageData, signMessage } = useSignMessage();
  const { sendTransaction } = useSendTransaction();
  const [messageToSign, setMessageToSign] = useState("Sign this message");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");

  const balance = useBalance({
    address: userHasWallet(userContext)
      ? (userContext.walletAddress as `0x${string}`)
      : undefined,
  });

  const connectExistingWallet = () =>
    connect({
      connector: connectors[0],
    });

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const createWallet = async () => {
    if (userContext.user && !userHasWallet(userContext)) {
      try {
        await userContext.createWallet();
        connectExistingWallet();
      } catch (error) {
        console.error("Wallet creation error:", error);
        alert(
          "Unable to create wallet. Please ensure you have completed authentication."
        );
      }
    }
  };

  const handleSignMessage = () => {
    signMessage({ message: messageToSign });
  };

  const handleSendTransaction = () => {
    if (!recipientAddress || !amount) return;

    sendTransaction({
      to: recipientAddress as `0x${string}`,
      value: parseEther(amount),
    });
  };

  // Interactive background effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900">
      {/* Interactive background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-50"
        style={{
          transform: `translate(${mousePosition.x / 50}px, ${
            mousePosition.y / 50
          }px)`,
          transition: "transform 0.2s ease-out",
        }}
      />

      {/* Content container */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Civic Auth Test</h1>
            <UserButton />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {userContext.user ? (
            <div className="space-y-8">
              {!userHasWallet(userContext) ? (
                <div className="relative group">
                  <button
                    onClick={createWallet}
                    className="w-full relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-px hover:from-blue-500 hover:to-blue-600 transition-all duration-300"
                  >
                    <div className="relative bg-gray-900 rounded-lg px-6 py-3">
                      <span className="relative text-lg font-semibold text-white">
                        Create Wallet
                      </span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Wallet Address Card */}
                  <div className="relative overflow-hidden rounded-lg backdrop-blur-xl bg-white/5 p-6 hover:bg-white/10 transition-all duration-300">
                    <h2 className="text-sm text-blue-400 uppercase tracking-wider mb-2">
                      Wallet Address
                    </h2>
                    <p className="font-mono text-white/80 break-all">
                      {userContext.walletAddress}
                    </p>
                  </div>

                  {/* Balance Card */}
                  <div className="relative overflow-hidden rounded-lg backdrop-blur-xl bg-white/5 p-6">
                    <h2 className="text-sm text-blue-400 uppercase tracking-wider mb-2">
                      Balance
                    </h2>
                    <p className="text-3xl font-bold text-white">
                      {balance?.data
                        ? `${(
                            BigInt(balance.data.value) / BigInt(1e18)
                          ).toString()} ${balance.data.symbol}`
                        : "Loading..."}
                    </p>
                  </div>

                  {/* Connection Status and Buttons */}
                  {!isConnected ? (
                    <button
                      onClick={connectExistingWallet}
                      className="w-full rounded-lg bg-green-600 hover:bg-green-500 px-6 py-3 text-white font-semibold transition-colors duration-300"
                    >
                      Connect Wallet
                    </button>
                  ) : (
                    <div className="space-y-6">
                      <div className="rounded-lg bg-green-500/10 p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-green-400">
                              Wallet Connected
                            </span>
                          </div>
                          <button
                            onClick={handleDisconnect}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors duration-300"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>

                      {/* Message Signing Card */}
                      <div className="rounded-lg backdrop-blur-xl bg-white/5 p-6 space-y-4">
                        <h2 className="text-sm text-purple-400 uppercase tracking-wider">
                          Sign Message
                        </h2>
                        <input
                          type="text"
                          value={messageToSign}
                          onChange={(e) => setMessageToSign(e.target.value)}
                          className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter message to sign"
                        />
                        <button
                          onClick={handleSignMessage}
                          className="w-full rounded-lg bg-purple-600 hover:bg-purple-500 px-6 py-3 text-white font-semibold transition-colors duration-300"
                        >
                          Sign Message
                        </button>
                        {signMessageData && (
                          <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <h3 className="text-sm text-purple-400 mb-2">
                              Signature
                            </h3>
                            <p className="font-mono text-sm text-white/80 break-all">
                              {signMessageData}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Transaction Card */}
                      <div className="rounded-lg backdrop-blur-xl bg-white/5 p-6 space-y-4">
                        <h2 className="text-sm text-orange-400 uppercase tracking-wider">
                          Send Transaction
                        </h2>
                        <input
                          type="text"
                          value={recipientAddress}
                          onChange={(e) => setRecipientAddress(e.target.value)}
                          className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Recipient address (0x...)"
                        />
                        <input
                          type="text"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Amount in ETH"
                        />
                        <button
                          onClick={handleSendTransaction}
                          className="w-full rounded-lg bg-orange-600 hover:bg-orange-500 px-6 py-3 text-white font-semibold transition-colors duration-300"
                        >
                          Send Transaction
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to Civic Auth
              </h2>
              <p className="text-blue-400">Sign in to access your wallet</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
