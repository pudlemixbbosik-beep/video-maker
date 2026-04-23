'use client';

import { useRef, useEffect } from 'react';
import { useDesignStore } from '@/store/designStore';
import { AgentConfig } from '@/types';

interface Props {
  config: AgentConfig;
}

/* ── 마크다운 렌더러 ────────────────────────────────── */
function renderLine(line: string, i: number) {
  if (line.startsWith('#### '))
    return <h4 key={i} className="text-sm font-semibold text-slate-200 mt-4 mb-1">{line.slice(5)}</h4>;
  if (line.startsWith('### '))
    return <h3 key={i} className="text-base font-bold text-amber-300 mt-6 mb-2">{line.slice(4)}</h3>;
  if (line.startsWith('## '))
    return <h2 key={i} className="text-lg font-bold text-amber-400 mt-7 mb-3 border-b border-amber-500/30 pb-1">{line.slice(3)}</h2>;
  if (line.startsWith('# '))
    return <h1 key={i} className="text-xl font-bold text-white mt-4 mb-3">{line.slice(2)}</h1>;
  if (line.startsWith('---'))
    return <hr key={i} className="border-slate-700 my-4" />;
  if (line.startsWith('| '))
    return <div key={i} className="font-mono text-xs text-slate-300 leading-5 whitespace-pre overflow-x-auto">{line}</div>;
  if (line.startsWith('- ') || line.startsWith('* '))
    return (
      <div key={i} className="flex gap-2 text-sm text-slate-300 my-0.5">
        <span className="text-amber-500 flex-shrink-0 mt-0.5">•</span>
        <span>{inlineBold(line.slice(2))}</span>
      </div>
    );
  if (line.trim() === '' || line.startsWith('```'))
    return <div key={i} className="h-1" />;

  return <p key={i} className="text-sm text-slate-300 leading-6">{inlineBold(line)}</p>;
}

function inlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>
      : p,
  );
}

function ContentView({ content }: { content: string }) {
  return (
    <div className="space-y-0.5">
      {content.split('\n').map((line, i) => renderLine(line, i))}
    </div>
  );
}

/* ── 메인 컴포넌트 ──────────────────────────────────── */
export default function AgentPanel({ config }: Props) {
  const { agents, setStatus, appendContent, resetAgent, setLastUpdated } = useDesignStore();
  const state = agents[config.key];
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 스트리밍 중 자동 스크롤
  useEffect(() => {
    if (state.status === 'running' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.content, state.status]);

  const run = async () => {
    if (state.status === 'running') return;
    abortRef.current = new AbortController();
    resetAgent(config.key);
    setStatus(config.key, 'running');

    try {
      const res = await fetch(`/api/agents/${config.key}`, {
        method: 'POST',
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) throw new Error('API 오류');

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        appendContent(config.key, dec.decode(value, { stream: true }));
      }
      setStatus(config.key, 'done');
      setLastUpdated(config.key, new Date().toISOString());
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setStatus(config.key, 'error');
      }
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setStatus(config.key, 'idle');
  };

  const exportDocx = async () => {
    const res = await fetch('/api/export/docx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentTitle: config.title,
        agentKey: config.key,
        content: state.content,
      }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.key}_${Date.now()}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>${config.title} - 상주시 시니어복합센터</title>
      <style>
        body{font-family:'Malgun Gothic',sans-serif;font-size:12px;line-height:1.7;padding:20mm;color:#111}
        h1{font-size:20px;margin-top:0} h2{font-size:16px;border-bottom:1px solid #ccc;padding-bottom:4px}
        h3{font-size:13px;color:#333} pre{white-space:pre-wrap;font-size:11px}
        hr{border:none;border-top:1px solid #ddd}
      </style></head><body>
      <h1>상주시 시니어복합센터 건립사업</h1>
      <h2>${config.title}</h2>
      <pre>${state.content.replace(/```[\s\S]*?```/g, '[다이어그램]').replace(/</g, '&lt;')}</pre>
      <script>window.print();window.close();</script>
    </body></html>`);
    w.document.close();
  };

  return (
    <div className="flex flex-col h-full">
      {/* 상단 툴바 */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-800 flex-shrink-0">
        {/* 상태 뱃지 */}
        <div className="flex items-center gap-1.5 text-xs">
          {state.status === 'idle' && <span className="text-slate-500">● 대기</span>}
          {state.status === 'running' && <span className="text-amber-400 animate-pulse">● 생성중</span>}
          {state.status === 'done' && <span className="text-emerald-400">✓ 완료</span>}
          {state.status === 'error' && <span className="text-red-400">✗ 오류</span>}
        </div>

        <div className="flex-1" />

        {/* 내보내기 버튼 */}
        {state.status === 'done' && (
          <>
            <button
              onClick={exportDocx}
              className="text-xs px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              📄 Word
            </button>
            <button
              onClick={exportPdf}
              className="text-xs px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg transition-colors"
            >
              🖨 PDF
            </button>
          </>
        )}

        {/* 실행/중지 버튼 */}
        {state.status === 'running' ? (
          <button
            onClick={stop}
            className="text-xs px-4 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            ■ 중지
          </button>
        ) : (
          <button
            onClick={run}
            className="text-xs px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors font-semibold"
          >
            {state.status === 'done' ? '↺ 재실행' : '▶ 실행'}
          </button>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        {/* 빈 상태 */}
        {state.status === 'idle' && state.content === '' && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <span className="text-6xl opacity-20">{config.icon}</span>
            <div>
              <p className="text-slate-400 text-sm font-medium">{config.title}</p>
              <p className="text-slate-600 text-xs mt-1">{config.subtitle}</p>
            </div>
            <button
              onClick={run}
              className="mt-2 px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded-xl transition-colors font-semibold"
            >
              ▶ AI 생성 시작
            </button>
            <p className="text-slate-700 text-xs">ANTHROPIC_API_KEY 환경변수가 설정되어 있어야 합니다</p>
          </div>
        )}

        {/* 오류 */}
        {state.status === 'error' && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
            오류가 발생했습니다. <code className="text-xs bg-red-900/30 px-1 rounded">ANTHROPIC_API_KEY</code> 환경변수를 확인하고 다시 시도해주세요.
          </div>
        )}

        {/* 생성된 콘텐츠 */}
        {state.content && <ContentView content={state.content} />}

        {/* 생성 중 커서 */}
        {state.status === 'running' && (
          <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse ml-1 mt-1 rounded-sm" />
        )}
      </div>

      {/* 하단 정보 */}
      {state.lastUpdated && state.status === 'done' && (
        <div className="px-5 py-2 border-t border-slate-800 text-xs text-slate-600 flex-shrink-0">
          생성 완료: {new Date(state.lastUpdated).toLocaleString('ko-KR')}
        </div>
      )}
    </div>
  );
}
