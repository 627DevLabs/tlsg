import Link from "next/link";

const features = [
  {
    href: "/revision",
    title: "Revision",
    icon: "🃏",
    description:
      "Create flashcard sets, flip through cards, and track which topics you know versus still need review.",
    color: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-400/60",
  },
  {
    href: "/timetable",
    title: "Timetable",
    icon: "📅",
    description:
      "Map out your weekly schedule with a colour-coded grid. Add subjects, times, and locations at a glance.",
    color: "from-violet-500/20 to-violet-600/10 border-violet-500/30 hover:border-violet-400/60",
  },
  {
    href: "/pacemaker",
    title: "Pacemaker",
    icon: "⏱️",
    description:
      "Stay focused with a Pomodoro timer. Set a daily session target and watch your productivity grow.",
    color: "from-sky-500/20 to-sky-600/10 border-sky-500/30 hover:border-sky-400/60",
  },
  {
    href: "/study-guide",
    title: "Study Guide",
    icon: "📖",
    description:
      "Build structured study guides with headings and rich notes. Organise everything by subject.",
    color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-400/60",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-7xl font-extrabold bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent tracking-tight mb-3">
          TLSG
        </h1>
        <p className="text-2xl font-semibold text-slate-200 mb-2">
          The Last Study Guide
        </p>
        <p className="text-slate-400 text-lg italic">An ocean of learning</p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`group relative flex flex-col gap-3 rounded-2xl border bg-gradient-to-br ${f.color} p-7 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
          >
            <span className="text-4xl">{f.icon}</span>
            <h2 className="text-xl font-bold text-white">{f.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {f.description}
            </p>
            <span className="absolute bottom-5 right-6 text-slate-400 group-hover:text-white transition-colors text-lg">
              →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
