import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const STATS = [
  { number: '50', label: 'MCQs', delay: '200ms' },
  { number: '50', label: 'MINS', delay: '320ms' },
  { number: '1', label: 'MARK EACH', delay: '440ms' },
];

export default function Home() {
  return (
    <PageShell>
      <section className="relative flex flex-1 flex-col items-center justify-center text-center min-h-[calc(100vh-14rem)] py-6 sm:py-10 md:py-12 overflow-hidden">
        {/* Subtle orange ambient glow */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[480px] h-[260px] bg-[#FDBA74]/[0.045] rounded-full blur-[80px] -z-10"
          aria-hidden="true"
        />

        {/* 1 & 2: Main Hero Heading */}
        <h1 className="animate-hero-reveal max-w-3xl text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
          <span className="block text-[#FDBA74]">Avishkar 5.0</span>
          <span className="block text-white mt-1.5 sm:mt-2.5">Quiz Competition</span>
        </h1>

        {/* 3: Start Quiz Button (Above stats) */}
        <div className="animate-button-reveal mt-8 sm:mt-10 flex justify-center">
          <Link
            to="/team"
            className="group inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base sm:text-lg font-bold text-[#0A0A0A] bg-[#FDBA74] hover:bg-[#FED7AA] active:bg-[#FB923C] shadow-md shadow-[#FDBA74]/15 hover:shadow-[0_0_28px_rgba(253,186,116,0.35)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDBA74] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
          >
            <span>Start Quiz</span>
            <span
              className="text-xl leading-none transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>

        {/* 4: Three Statistics Cards */}
        <dl className="mt-10 sm:mt-12 grid grid-cols-3 gap-2.5 sm:gap-4 md:gap-5 w-full max-w-xs sm:max-w-md mx-auto">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="animate-card-reveal rounded-xl border border-[#333333] bg-[#171717] px-3 sm:px-4 py-3 sm:py-4 text-center shadow-sm"
              style={{ animationDelay: s.delay }}
            >
              <dt className="font-mono text-xl sm:text-3xl font-extrabold text-[#FDBA74] tracking-tight">
                {s.number}
              </dt>
              <dd className="mt-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </PageShell>
  );
}
