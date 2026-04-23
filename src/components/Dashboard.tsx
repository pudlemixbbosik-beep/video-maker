'use client';

import { AGENT_CONFIGS, PROJECT, SCHEDULE, JUDGE_CRITERIA } from '@/lib/projectInfo';
import { useDesignStore } from '@/store/designStore';

interface DashboardProps {
  onSelectAgent: (key: string) => void;
}

function useDDay() {
  const deadline = new Date(PROJECT.submitDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000);
}

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  idle:    { text: '대기',   cls: 'text-slate-500' },
  running: { text: '생성중', cls: 'text-amber-400 animate-pulse' },
  done:    { text: '완료',   cls: 'text-emerald-400' },
  error:   { text: '오류',   cls: 'text-red-400' },
};

const CERTS = [
  { icon: '⚡', label: PROJECT.certZeroEnergy, required: true },
  { icon: '♿', label: PROJECT.certBF,          required: true },
  { icon: '☀️', label: PROJECT.renewableEnergy, required: true },
] as const;

export default function Dashboard({ onSelectAgent }: DashboardProps) {
  const { agents } = useDesignStore();
  const dDay = useDDay();

  const done    = Object.values(agents).filter(a => a.status === 'done').length;
  const running = Object.values(agents).filter(a => a.status === 'running').length;
  const total   = AGENT_CONFIGS.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-5">

        {/* ── 상단: D-Day + 프로젝트 헤더 ── */}
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-slate-800
                        border border-amber-500/30 rounded-2xl p-5 flex flex-col md:flex-row gap-5">
          {/* 프로젝트 정보 */}
          <div className="flex-1">
            <div className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">
              설계공모 AI 시스템
            </div>
            <h2 className="text-white text-lg font-bold leading-snug">{PROJECT.name}</h2>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              {[
                ['위치',   PROJECT.location],
                ['대지',   `${PROJECT.siteArea} / ${PROJECT.floorArea}`],
                ['규모',   PROJECT.floors],
                ['공사비', PROJECT.budget],
              ].map(([k, v]) => (
                <div key={k}>
                  <span className="text-slate-500">{k} </span>
                  <span className="text-slate-300">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* D-Day */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center
                          bg-slate-900/60 border border-amber-500/20 rounded-xl px-8 py-4 min-w-[140px]">
            <div className="text-amber-400 text-xs font-semibold mb-1">작품 제출까지</div>
            <div className={`text-5xl font-black tabular-nums
                            ${dDay <= 7 ? 'text-red-400' : dDay <= 30 ? 'text-amber-400' : 'text-white'}`}>
              D-{dDay}
            </div>
            <div className="text-slate-500 text-xs mt-1">{PROJECT.deadline}</div>
            {/* 에이전트 진행률 */}
            <div className="mt-3 w-full">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>에이전트 완료</span>
                <span className="text-emerald-400">{done}/{total}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(done / total) * 100}%` }}
                />
              </div>
            </div>
            {running > 0 && (
              <div className="text-amber-400 text-xs mt-1.5 animate-pulse">{running}개 실행중…</div>
            )}
          </div>
        </div>

        {/* ── 하단 3열 레이아웃 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* 왼쪽: 심사기준 + 필수인증 */}
          <div className="space-y-5">

            {/* 심사 평가기준 */}
            <section className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                심사 평가기준
              </h3>
              <div className="space-y-3">
                {JUDGE_CRITERIA.map((c) => (
                  <div key={c.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{c.label}</span>
                      <span className="text-amber-400 font-semibold">{c.score}점</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-amber-500/70 h-2 rounded-full"
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-1 flex justify-between text-xs border-t border-slate-700">
                  <span className="text-slate-500">합계</span>
                  <span className="text-white font-bold">
                    {JUDGE_CRITERIA.reduce((s, c) => s + c.score, 0)}점
                  </span>
                </div>
              </div>
            </section>

            {/* 필수 인증 체크리스트 */}
            <section className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                필수 인증
              </h3>
              <div className="space-y-2.5">
                {CERTS.map((cert) => (
                  <div key={cert.label}
                    className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-700/40 border border-slate-600/50">
                    <span className="text-lg flex-shrink-0 mt-0.5">{cert.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs text-slate-300 leading-snug">{cert.label}</div>
                      <div className="text-xs text-red-400 mt-0.5">필수 제출</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* 오른쪽 2열: 에이전트 카드 그리드 */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                에이전트
              </h3>
              <span className="text-xs text-slate-600">클릭하여 실행</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {AGENT_CONFIGS.map((cfg, i) => {
                const st = agents[cfg.key];
                const badge = STATUS_LABEL[st.status];
                return (
                  <button
                    key={cfg.key}
                    onClick={() => onSelectAgent(cfg.key)}
                    className={`text-left p-3.5 rounded-xl border transition-all group
                      bg-slate-800 hover:bg-slate-700 hover:border-amber-500/60
                      ${st.status === 'done'
                        ? 'border-emerald-500/40'
                        : st.status === 'running'
                          ? 'border-amber-500/60'
                          : cfg.borderClass}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xl">{cfg.icon}</span>
                      <span className="text-slate-600 text-xs">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div className={`font-semibold text-sm ${cfg.colorClass}`}>{cfg.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-snug">{cfg.subtitle}</div>
                    <div className={`text-xs mt-2 font-medium ${badge.cls}`}>
                      {st.status === 'idle' ? '→ 실행' : `● ${badge.text}`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 공모 일정 타임라인 */}
            <section className="mt-5 bg-slate-800/80 border border-slate-700 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                공모 일정
              </h3>
              <div className="relative">
                {/* 연결선 */}
                <div className="absolute top-3 left-3 right-3 h-px bg-slate-700" />
                <div className="flex justify-between relative">
                  {SCHEDULE.map((s) => {
                    const isPast = new Date(s.isoDate) < today;
                    const isToday = s.isoDate === today.toISOString().slice(0, 10);
                    const isDeadline = s.isoDate === PROJECT.submitDate;
                    return (
                      <div key={s.isoDate} className="flex flex-col items-center gap-1.5 flex-1">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10
                          ${isPast
                            ? 'bg-emerald-500 border-emerald-400'
                            : isDeadline
                              ? 'bg-amber-500 border-amber-400 ring-2 ring-amber-500/30'
                              : 'bg-slate-700 border-slate-600'}`}
                        >
                          {isPast && <span className="text-white text-xs">✓</span>}
                          {!isPast && isDeadline && <span className="text-white text-xs">!</span>}
                        </div>
                        <div className={`text-xs font-semibold text-center
                          ${isDeadline ? 'text-amber-400' : isPast ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {s.label}
                        </div>
                        <div className="text-slate-600 text-xs">{s.date}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </div>

        <p className="text-xs text-slate-700 text-center pb-1">
          ANTHROPIC_API_KEY 환경변수 필요 · 각 에이전트 클릭 후 ▶ 실행
        </p>
      </div>
    </div>
  );
}
