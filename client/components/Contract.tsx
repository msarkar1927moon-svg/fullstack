"use client";

import { useState, useCallback } from "react";
import {
  createSubscription,
  paySubscription,
  cancelSubscription,
  getSubscription,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c3aed]/30 focus-within:shadow-[0_0_20px_rgba(124,58,237,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Status Config ────────────────────────────────────────────

const SUB_STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string; variant: "success" | "warning" | "info" }> = {
  active: { color: "text-[#34d399]", bg: "bg-[#34d399]/10", border: "border-[#34d399]/20", dot: "bg-[#34d399]", variant: "success" },
  none: { color: "text-[#f87171]", bg: "bg-[#f87171]/10", border: "border-[#f87171]/20", dot: "bg-[#f87171]", variant: "warning" },
};

// ── Main Component ───────────────────────────────────────────

type Tab = "view" | "create" | "pay" | "cancel";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("view");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const [createAmount, setCreateAmount] = useState("");
  const [createInterval, setCreateInterval] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [isPaying, setIsPaying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [isViewing, setIsViewing] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<{
    subscriber: string;
    amount: bigint;
    interval: number;
    last_payment: number;
  } | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleCreateSubscription = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!createAmount.trim() || !createInterval.trim()) return setError("Fill in all fields");
    setError(null);
    setIsCreating(true);
    setTxStatus("Awaiting signature...");
    try {
      const amount = BigInt(createAmount.trim());
      const interval = parseInt(createInterval.trim(), 10);
      await createSubscription(walletAddress, amount, interval);
      setTxStatus("Subscription created on-chain!");
      setCreateAmount("");
      setCreateInterval("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsCreating(false);
    }
  }, [walletAddress, createAmount, createInterval]);

  const handlePaySubscription = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setIsPaying(true);
    setTxStatus("Awaiting signature...");
    try {
      await paySubscription(walletAddress);
      setTxStatus("Payment recorded on-chain!");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsPaying(false);
    }
  }, [walletAddress]);

  const handleCancelSubscription = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setIsCancelling(true);
    setTxStatus("Awaiting signature...");
    try {
      await cancelSubscription(walletAddress);
      setTxStatus("Subscription cancelled!");
      setSubscriptionData(null);
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsCancelling(false);
    }
  }, [walletAddress]);

  const handleViewSubscription = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setIsViewing(true);
    setSubscriptionData(null);
    try {
      const result = await getSubscription(walletAddress);
      if (result && typeof result === "object") {
        setSubscriptionData(result as {
          subscriber: string;
          amount: bigint;
          interval: number;
          last_payment: number;
        });
      } else {
        setError("No subscription found");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsViewing(false);
    }
  }, [walletAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "view", label: "View", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "create", label: "Create", icon: <CreditCardIcon />, color: "#7c3aed" },
    { key: "pay", label: "Pay", icon: <RefreshIcon />, color: "#34d399" },
    { key: "cancel", label: "Cancel", icon: <XIcon />, color: "#f87171" },
  ];

  // Format interval from seconds to human readable
  const formatInterval = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  // Check if payment is due
  const isPaymentDue = (sub: typeof subscriptionData): boolean => {
    if (!sub) return false;
    const now = Math.floor(Date.now() / 1000);
    return now >= sub.last_payment + sub.interval;
  };

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") || txStatus.includes("cancelled") || txStatus.includes("created") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c3aed]/20 to-[#4fc3f7]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7c3aed]">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Subscription DApp</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setSubscriptionData(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* View */}
            {activeTab === "view" && (
              <div className="space-y-5">
                <MethodSignature name="get_subscription" params="(subscriber: Address)" returns="-> Subscription" color="#4fc3f7" />
                {walletAddress ? (
                  <ShimmerButton onClick={handleViewSubscription} disabled={isViewing} shimmerColor="#4fc3f7" className="w-full">
                    {isViewing ? <><SpinnerIcon /> Fetching...</> : <><SearchIcon /> View My Subscription</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#4fc3f7]/20 bg-[#4fc3f7]/[0.03] py-4 text-sm text-[#4fc3f7]/60 hover:border-[#4fc3f7]/30 hover:text-[#4fc3f7]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to view subscription
                  </button>
                )}

                {subscriptionData && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Subscription Details</span>
                      {(() => {
                        const status = isPaymentDue(subscriptionData) ? "due" : "active";
                        const cfg = SUB_STATUS_CONFIG[status];
                        return cfg ? (
                          <Badge variant={cfg.variant}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                            {status === "due" ? "Payment Due" : "Active"}
                          </Badge>
                        ) : (
                          <Badge>Active</Badge>
                        );
                      })()}
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Subscriber</span>
                        <span className="font-mono text-sm text-white/80">{truncate(subscriptionData.subscriber)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Amount</span>
                        <span className="font-mono text-sm text-white/80">{subscriptionData.amount.toString()} XLM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Interval</span>
                        <span className="font-mono text-sm text-white/80">{formatInterval(subscriptionData.interval)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Last Payment</span>
                        <span className="font-mono text-sm text-white/80">{new Date(subscriptionData.last_payment * 1000).toLocaleString()}</span>
                      </div>
                      {isPaymentDue(subscriptionData) && (
                        <div className="mt-4 pt-4 border-t border-white/[0.06]">
                          <ShimmerButton onClick={() => setActiveTab("pay")} shimmerColor="#34d399" className="w-full">
                            <RefreshIcon /> Pay Now
                          </ShimmerButton>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Create */}
            {activeTab === "create" && (
              <div className="space-y-5">
                <MethodSignature name="create_subscription" params="(subscriber: Address, amount: i128, interval: u64)" color="#7c3aed" />
                <Input 
                  label="Amount (in Stroops)" 
                  value={createAmount} 
                  onChange={(e) => setCreateAmount(e.target.value)} 
                  placeholder="e.g. 10000000 (10 XLM)" 
                  type="number"
                />
                <Input 
                  label="Interval (seconds)" 
                  value={createInterval} 
                  onChange={(e) => setCreateInterval(e.target.value)} 
                  placeholder="e.g. 2592000 (30 days)" 
                  type="number"
                />
                <div className="text-xs text-white/25 space-y-1">
                  <p>Common intervals:</p>
                  <p>30 days = 2592000 | 7 days = 604800 | 1 day = 86400</p>
                </div>
                {walletAddress ? (
                  <ShimmerButton onClick={handleCreateSubscription} disabled={isCreating} shimmerColor="#7c3aed" className="w-full">
                    {isCreating ? <><SpinnerIcon /> Creating...</> : <><CreditCardIcon /> Create Subscription</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c3aed]/20 bg-[#7c3aed]/[0.03] py-4 text-sm text-[#7c3aed]/60 hover:border-[#7c3aed]/30 hover:text-[#7c3aed]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to create subscription
                  </button>
                )}
              </div>
            )}

            {/* Pay */}
            {activeTab === "pay" && (
              <div className="space-y-5">
                <MethodSignature name="pay" params="(subscriber: Address)" color="#34d399" />
                <div className="rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.03] p-4">
                  <p className="text-sm text-[#34d399]/80">
                    Record a payment for your subscription. This updates the last payment timestamp.
                  </p>
                  <p className="text-xs text-[#34d399]/40 mt-2">
                    Note: Actual token transfer would be handled by a token contract.
                  </p>
                </div>
                {walletAddress ? (
                  <ShimmerButton onClick={handlePaySubscription} disabled={isPaying} shimmerColor="#34d399" className="w-full">
                    {isPaying ? <><SpinnerIcon /> Processing...</> : <><RefreshIcon /> Record Payment</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#34d399]/20 bg-[#34d399]/[0.03] py-4 text-sm text-[#34d399]/60 hover:border-[#34d399]/30 hover:text-[#34d399]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to pay
                  </button>
                )}
              </div>
            )}

            {/* Cancel */}
            {activeTab === "cancel" && (
              <div className="space-y-5">
                <MethodSignature name="cancel" params="(subscriber: Address)" color="#f87171" />
                <div className="rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.03] p-4">
                  <p className="text-sm text-[#f87171]/80">
                    Cancel your subscription. This will remove your subscription from the blockchain.
                  </p>
                </div>
                {walletAddress ? (
                  <ShimmerButton onClick={handleCancelSubscription} disabled={isCancelling} shimmerColor="#f87171" className="w-full">
                    {isCancelling ? <><SpinnerIcon /> Cancelling...</> : <><XIcon /> Cancel Subscription</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#f87171]/20 bg-[#f87171]/[0.03] py-4 text-sm text-[#f87171]/60 hover:border-[#f87171]/30 hover:text-[#f87171]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to cancel
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Subscription DApp &middot; Soroban</p>
            <div className="flex items-center gap-2">
              {["Create", "Pay", "Cancel"].map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="font-mono text-[9px] text-white/15">{s}</span>
                  {i < 2 && <span className="text-white/10 text-[8px]">&rarr;</span>}
                </span>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
