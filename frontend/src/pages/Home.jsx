import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const FEATURES = [
  { title: 'Round 1 — 30 MCQs', desc: 'AI tools & trending tech. One question at a time, full navigation.' },
  { title: 'Live countdown', desc: 'A single round timer with auto-submit when it hits zero.' },
  { title: 'Hidden scoring', desc: 'Answers are scored on the server. Scores stay sealed until the finale.' },
];

export default function Home() {
  return (
    <PageShell>
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="animate-fade-in">
          <span className="chip mb-5 border-indigo-500/40 bg-indigo-500/10 text-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Registrations open
          </span>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            The <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">AI Quiz</span>
            <br />Time
          </h1>
          <p className="mt-5 max-w-md text-lg text-slate-300">
            20 teams. One stage. A head-to-head battle across AI tools, cloud, security and the
            technology shaping tomorrow.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/team" className="btn-primary text-base">
              Enter as a Team
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              ['20', 'Teams'],
              ['30', 'MCQs'],
              ['1', 'Mark each'],
            ].map(([n, l]) => (
              <div key={l} className="card px-4 py-3 text-center">
                <dt className="font-mono text-2xl font-bold text-white">{n}</dt>
                <dd className="text-xs uppercase tracking-wider text-slate-400">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid gap-4">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="card animate-fade-in p-5" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 font-mono font-bold text-indigo-300">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{f.title}</h3>
                  <p className="mt-0.5 text-sm text-slate-400">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="card border-indigo-500/30 bg-indigo-500/5 p-5 text-sm text-indigo-100">
            <span className="font-semibold">Tip:</span> Pick your team number at the check-in desk,
            enter both members, then hit <span className="font-semibold">Start Round 1</span> when the
            proctor says go.
          </div>
        </div>
      </section>
    </PageShell>
  );
}
