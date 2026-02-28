export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AutoDev
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Understand any codebase in minutes, not weeks.
        </p>
        <p className="text-gray-400 mb-12 max-w-xl mx-auto">
          AI-powered codebase onboarding that generates interactive architecture
          maps, guided walkthroughs, and lets you ask questions about any
          repository.
        </p>

        <div className="flex gap-4 justify-center mb-16">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Get Started
          </a>
          <a
            href="#features"
            className="px-6 py-3 border border-gray-700 hover:border-gray-500 rounded-lg font-medium transition-colors"
          >
            Learn More
          </a>
        </div>

        <div id="features" className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <FeatureCard
            title="Architecture Maps"
            description="Interactive visual maps of your codebase structure, modules, and dependencies. See how everything connects."
            icon="🗺️"
          />
          <FeatureCard
            title="Guided Walkthroughs"
            description="Step-by-step tours of critical code paths. 'How does auth work?' — answered with code and context."
            icon="🚶"
          />
          <FeatureCard
            title="Convention Detection"
            description="Automatically discovers your team's coding patterns, architecture decisions, and best practices."
            icon="📐"
          />
          <FeatureCard
            title="Smart Q&A"
            description="Ask any question about the codebase in plain English. Get answers with file references."
            icon="💬"
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
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
