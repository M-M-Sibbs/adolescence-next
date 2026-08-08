import Link from "next/link";
import { BookOpen, Brain, LineChart, PenLine, ArrowRight } from "lucide-react";

const chapters = [
  { n: "01", icon: Brain, title: "A tutor that read the lesson", desc: "The AI has your lesson text, PDFs, and notes in hand before you ask. Answers stay grounded in what you are actually studying — not the open internet." },
  { n: "02", icon: BookOpen, title: "Lessons, not a feed", desc: "Video with transcripts, downloadable PDFs, and written material organized into a path you move through deliberately." },
  { n: "03", icon: PenLine, title: "Quizzes that explain", desc: "Practice questions — written by instructors or generated from the lesson — that tell you why an answer is right, not just whether it was." },
  { n: "04", icon: LineChart, title: "Progress you can read", desc: "Completed lessons, quiz scores, tutor sessions, and streaks, kept on one quiet dashboard." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
            <PenLine size={16} className="text-white" />
          </div>
          <span className="font-display font-semibold text-lg sm:text-xl tracking-tight">Adolescence</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/login" className="text-ink-700 hover:text-ink-900 text-sm font-medium transition-colors">Sign in</Link>
          <Link href="/register" className="btn-primary text-sm">Start learning</Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-12 sm:pb-20">
        <div className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-12 items-end border-b border-cream-400 pb-10 sm:pb-16">
          <div>
            <p className="eyebrow mb-4 sm:mb-6 text-[10px] sm:text-xs animate-fade-in">A learning desk · with an AI in the margin</p>
            <h1 className="font-display text-[2.5rem] leading-[1.05] sm:text-6xl md:text-7xl font-semibold sm:leading-[1.02] mb-5 sm:mb-7 animate-slide-up">
              Study the lesson.<br />
              <span className="italic text-indigo-500">Ask the margin</span><br />
              anything.
            </h1>
            <p className="text-ink-700 text-base sm:text-lg max-w-xl leading-relaxed mb-7 sm:mb-9 animate-slide-up">
              Adolescence keeps your lessons on the page and a tutor in the margin — one that has already read the material and answers with it in mind.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 animate-slide-up">
              <Link href="/register" className="btn-primary flex items-center justify-center gap-2 text-base px-7 py-3.5 w-full sm:w-auto">
                Open your desk <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="btn-ghost text-base px-7 py-3.5 w-full sm:w-auto text-center">I have an account</Link>
            </div>
          </div>

          <div className="w-full lg:w-72 animate-fade-in">
            <div className="bg-white border border-cream-400 rounded-xl shadow-lift p-5 lg:-rotate-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400 mb-3">margin · lesson 3</p>
              <p className="font-display text-lg leading-snug mb-3">&quot;Why does recursion need a base case?&quot;</p>
              <div className="h-px bg-cream-300 my-3" />
              <p className="text-sm text-ink-700 leading-relaxed">
                Without one, each call keeps calling itself — the stack fills up and the program stops. The base case is the floor that ends the descent.
              </p>
              <p className="font-mono text-[11px] text-indigo-500 mt-4">— AI tutor, grounded in your notes</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold mb-8 sm:mb-12">What&apos;s on the desk</h2>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 sm:gap-y-10">
          {chapters.map(({ n, icon: Icon, title, desc }) => (
            <div key={n} className="flex gap-4 sm:gap-5 group">
              <div className="font-mono text-sm text-indigo-500 pt-1 w-8 flex-shrink-0">{n}</div>
              <div className="border-l border-cream-400 pl-5 group-hover:border-indigo-400 transition-colors">
                <div className="flex items-center gap-2.5 mb-2">
                  <Icon size={18} className="text-indigo-500" />
                  <h3 className="font-display text-lg sm:text-xl font-semibold">{title}</h3>
                </div>
                <p className="text-ink-700 text-sm sm:text-base leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="bg-ink-900 rounded-2xl px-6 py-10 sm:px-8 sm:py-12 md:px-14 md:py-16 text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-paper mb-3 sm:mb-4">Pull up a chair.</h2>
          <p className="text-cream-300 text-sm sm:text-base mb-7 sm:mb-8 max-w-md mx-auto">Create a free account and start your first lesson with a tutor in the margin.</p>
          <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-ink-900 font-medium px-7 py-3.5 rounded-lg transition-all active:scale-[0.98] w-full sm:w-auto">
            Create free account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-cream-400 text-center py-6 sm:py-7 px-4 text-ink-500 text-xs sm:text-sm">
        <span className="font-display italic">Adolescence</span> · a quiet place to learn · © 2025
      </footer>
    </div>
  );
}
