"use client";
import { useState } from "react";
import Link from "next/link";
import { brandConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Building2, Mail, ArrowRight, Loader2, CheckCircle, Users } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSent(true);
      if (data.devLink) setDevLink(data.devLink);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brandConfig.accent} 0%, #001a4a 100%)` }}
      >
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute border border-white rounded-sm"
              style={{
                width: `${60 + Math.random() * 80}px`,
                height: `${40 + Math.random() * 60}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-base">
              {brandConfig.logoText}
            </div>
            <div>
              <div className="font-semibold text-base">{brandConfig.firmName}</div>
              <div className="text-white/60 text-xs">{brandConfig.tagline}</div>
            </div>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4">
            Your listing,<br />always current.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm">
            A private portal for the Williams Roth Group's seller clients. Weekly AI-drafted
            updates, real-time activity, and full market visibility — in one place.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: "📊", text: "Live buyer pipeline & offer tracking" },
            { icon: "🤖", text: "AI-drafted weekly updates from broker sources" },
            { icon: "📁", text: "Due diligence room activity feed" },
            { icon: "📈", text: "Marketing performance metrics" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-white/80 text-sm">
              <span className="text-base">{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: brandConfig.accent }}
            >
              {brandConfig.logoText}
            </div>
            <span className="font-semibold text-gray-900">{brandConfig.firmName}</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
          <p className="text-gray-500 text-sm mb-8">Enter your email to receive a secure sign-in link.</p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Send sign-in link
              </Button>
            </form>
          ) : (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <div className="flex items-center gap-2 font-medium mb-1">
                <CheckCircle className="h-4 w-4" />
                Check your inbox
              </div>
              <p className="text-emerald-700">A sign-in link has been sent to <strong>{email}</strong>.</p>
              {devLink && (
                <div className="mt-3 pt-3 border-t border-emerald-200">
                  <p className="text-xs text-emerald-600 font-medium mb-1">DEV — click to sign in:</p>
                  <a href={devLink} className="text-xs text-[#003087] underline break-all">{devLink}</a>
                </div>
              )}
            </div>
          )}

          {/* Dev bypass */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="h-px flex-1 bg-gray-200" />
              Dev bypass
              <span className="h-px flex-1 bg-gray-200" />
            </p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/api/dev-login?role=BROKER"
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 rounded-md text-gray-600 hover:border-[#003087] hover:text-[#003087] hover:bg-[#003087]/5 transition-colors"
              >
                <Building2 className="h-3.5 w-3.5" />
                Log in as Broker
              </a>
              <a
                href="/api/dev-login?role=SELLER"
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 rounded-md text-gray-600 hover:border-[#003087] hover:text-[#003087] hover:bg-[#003087]/5 transition-colors"
              >
                <Users className="h-3.5 w-3.5" />
                Log in as Seller
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
