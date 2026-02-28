"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AutoDev
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#languages" className="hover:text-white transition-colors">Languages</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard?demo=true"
              className="px-4 py-2 text-sm border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
            >
              Live Demo
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-purple-600/5 to-transparent" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 border border-blue-500/30 bg-blue-500/10 rounded-full text-sm text-blue-300">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            AI for Bharat Hackathon 2026
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Onboard developers in{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              hours, not weeks
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-3xl mx-auto">
            AI-powered codebase understanding that generates animated architecture maps,
            guided walkthroughs, and multi-language explanations.
          </p>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            Install on any GitHub repo. Get interactive maps, setup guides, and Q&A — in Hindi, Tamil, Telugu, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              Get Started — Free
            </a>
            <a
              href="/dashboard?demo=true"
              className="px-8 py-4 border border-gray-700 hover:border-gray-500 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>▶</span> Watch Demo
            </a>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <StatCounter label="Onboarding Time" value="2 hrs" subtext="vs 2-4 weeks" />
            <StatCounter label="Setup Time" value="10 min" subtext="vs 1-3 days" />
            <StatCounter label="Languages" value="7" subtext="Indian languages" />
            <StatCounter label="Understanding" value="80%" subtext="in first session" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything a new developer needs
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Four unique features no competitor has — purpose-built for developer onboarding as learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard
              title="Animated Architecture Maps"
              description="Watch request flows light up node-by-node. Click any component to pause and get an AI explanation. See how the entire system actually works."
              icon="🗺️"
              badge="Unique to AutoDev"
              gradient="from-blue-500/20 to-cyan-500/20"
            />
            <FeatureCard
              title="Environment Setup Autopilot"
              description="AI-generated setup guide that flags conflicts, missing docs, and version mismatches. Day 1 setup in 10 minutes, not 2 days."
              icon="⚡"
              badge="Unique to AutoDev"
              gradient="from-green-500/20 to-emerald-500/20"
            />
            <FeatureCard
              title="Multi-Language Explanations"
              description={`"Explain auth like I'm a fresher" — in Hindi, Tamil, Telugu, Kannada, Bengali, or Marathi. Because 83% of Indian graduates learn better in their native language.`}
              icon="🌐"
              badge="Bharat-First"
              gradient="from-orange-500/20 to-yellow-500/20"
            />
            <FeatureCard
              title="Learning Progress Dashboard"
              description="Track understanding with skill radar charts, progress timelines, and module completion. See '0% → 80% in 2 hours' with real metrics."
              icon="📊"
              badge="Unique to AutoDev"
              gradient="from-purple-500/20 to-pink-500/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <MiniFeatureCard
              title="Guided Walkthroughs"
              description="Step-by-step code tours auto-generated from analysis."
              icon="🚶"
            />
            <MiniFeatureCard
              title="Codebase Q&A"
              description="Ask questions in plain English, get answers with file references."
              icon="💬"
            />
            <MiniFeatureCard
              title="Convention Detection"
              description="Automatically discovers coding patterns and best practices."
              icon="📐"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Three steps. Ten minutes. Full understanding.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              title="Install"
              description="Add the AutoDev GitHub App to your repo. Analysis starts automatically — no config needed."
              icon="🔗"
            />
            <StepCard
              step={2}
              title="Explore"
              description="Animated maps, walkthroughs, Q&A, and setup guides are generated by AI. Pick your language."
              icon="🧠"
            />
            <StepCard
              step={3}
              title="Learn"
              description="Ask questions, follow walkthroughs, track your progress. Go from 0% to 80% understanding."
              icon="📈"
            />
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Every competitor helps devs <span className="text-gray-500">do work</span>.
              <br />
              AutoDev helps devs <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">learn</span>.
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="py-3 px-4 text-blue-400 font-bold">AutoDev</th>
                  <th className="py-3 px-4 text-gray-500 font-medium">CodeRabbit</th>
                  <th className="py-3 px-4 text-gray-500 font-medium">Greptile</th>
                  <th className="py-3 px-4 text-gray-500 font-medium">Swimm</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Animated Architecture Maps", true, false, false, false],
                  ["Environment Setup Autopilot", true, false, false, false],
                  ["Indian Language Support", true, false, false, false],
                  ["Learning Progress Tracking", true, false, false, false],
                  ["Skill Radar Charts", true, false, false, false],
                  ["Guided Walkthroughs", true, false, false, "partial"],
                  ["Codebase Q&A", true, false, true, false],
                ].map(([feature, ...vals], i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td className="py-3 px-4 text-gray-300">{feature as string}</td>
                    {vals.map((v, j) => (
                      <td key={j} className="py-3 px-4 text-center">
                        {v === true ? (
                          <span className="text-green-400">✓</span>
                        ) : v === "partial" ? (
                          <span className="text-yellow-500">~</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Languages */}
      <section id="languages" className="py-20 px-6 bg-gray-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Bharat</h2>
          <p className="text-gray-400 text-lg mb-12">
            Code explanations in 7 Indian languages — because learning should have no language barrier.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { lang: "English", code: "en", flag: "🇺🇸" },
              { lang: "Hindi", code: "hi", flag: "🇮🇳" },
              { lang: "Tamil", code: "ta", flag: "🇮🇳" },
              { lang: "Telugu", code: "te", flag: "🇮🇳" },
              { lang: "Kannada", code: "kn", flag: "🇮🇳" },
              { lang: "Bengali", code: "bn", flag: "🇮🇳" },
              { lang: "Marathi", code: "mr", flag: "🇮🇳" },
            ].map((l) => (
              <div
                key={l.code}
                className="flex items-center gap-2 px-5 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:border-blue-500/50 transition-colors"
              >
                <span className="text-lg">{l.flag}</span>
                <span className="font-medium">{l.lang}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gray-800/30 border border-gray-700/50 rounded-xl max-w-2xl mx-auto">
            <p className="text-gray-400 text-sm mb-2">Example in Hindi:</p>
            <p className="text-lg text-gray-200 italic">
              &ldquo;Auth module kaise kaam karta hai?&rdquo;
            </p>
            <p className="text-gray-400 mt-3 text-sm">
              → &ldquo;Yeh authentication module JWT tokens ka use karta hai...&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
          <p className="text-gray-400 text-lg mb-4 max-w-2xl mx-auto">
            A fresher joins a company. In 10 minutes: animated system map,
            AI explanations in their language, verified setup guide, and a learning path.
          </p>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-10">
            2 weeks → 2 hours.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-left mb-12">
            <DemoStep num={1} title="Install" desc="GitHub App on repo" />
            <DemoStep num={2} title="Map" desc="Animated architecture lights up" />
            <DemoStep num={3} title="Ask" desc="Q&A in Hindi, Tamil..." />
            <DemoStep num={4} title="Setup" desc="8 steps, 2 conflicts found" />
            <DemoStep num={5} title="Track" desc="0% → 45% in 10 min" />
          </div>

          <a
            href="/dashboard?demo=true"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-blue-500/25"
          >
            <span>▶</span> Try the Live Demo
          </a>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-6 bg-gray-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Built With</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Next.js 14", "TypeScript", "React Flow", "Tailwind CSS",
              "AWS Bedrock", "Claude 3.5 Sonnet", "Titan Embeddings",
              "Express.js", "DynamoDB", "S3", "Lambda",
              "Probot", "VS Code API", "pnpm Workspaces",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AutoDev
            </span>
            <span className="text-gray-600 text-sm ml-2">
              AI for Bharat Hackathon 2026 — Student Track
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Built with ❤️ for 4.3M Indian developers
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ---------- Sub-components ---------- */

function StatCounter({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-sm text-gray-300 font-medium">{label}</div>
      <div className="text-xs text-gray-500">{subtext}</div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  badge,
  gradient,
}: {
  title: string;
  description: string;
  icon: string;
  badge: string;
  gradient: string;
}) {
  return (
    <div className={`relative p-8 border border-gray-800 rounded-2xl bg-gradient-to-br ${gradient} hover:border-gray-600 transition-all group`}>
      {badge && (
        <span className="absolute top-4 right-4 text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
          {badge}
        </span>
      )}
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function MiniFeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-6 border border-gray-800 rounded-xl bg-gray-900/50 hover:border-gray-700 transition-colors">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="relative p-8 border border-gray-800 rounded-2xl bg-gray-900/30 text-center">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
        {step}
      </div>
      <div className="text-3xl mb-4 mt-2">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function DemoStep({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex md:flex-col items-center md:items-center gap-3 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
        {num}
      </div>
      <div className="md:text-center">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-gray-400 text-xs">{desc}</div>
      </div>
    </div>
  );
}
