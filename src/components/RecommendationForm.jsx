/**
 * 智能推荐表单
 * - 预算（输入框 + 滑块联动）
 * - 用途
 * - 品牌偏好
 * - 一键生成
 */
import { useState, useMemo } from 'react';
import { useBuildStore } from '../store/useBuildStore.js';
import { recommend, USAGE_OPTIONS, BRAND_OPTIONS, formatPrice } from '../utils/recommender.js';

export default function RecommendationForm() {
  const setBuild = useBuildStore((s) => s.setBuild);
  const clearBuild = useBuildStore((s) => s.clearBuild);

  const [budget, setBudget] = useState(8000);
  const [usage, setUsage] = useState('gaming');
  const [brand, setBrand] = useState('any');
  const [result, setResult] = useState(null);

  // 滑块刻度
  const BUDGET_MIN = 3000;
  const BUDGET_MAX = 30000;
  const BUDGET_STEP = 500;

  const handleGenerate = () => {
    const r = recommend({ budget, usage, brand });
    setResult(r);
  };

  const handleApply = () => {
    if (!result) return;
    clearBuild();
    setBuild(result.build);
  };

  // 预算占比进度条
  const ratioBars = useMemo(() => {
    if (!result) return null;
    const cats = Object.entries(result.report.details);
    return cats.map(([cat, info]) => (
      <div key={cat} className="text-[11px]">
        <div className="flex justify-between text-slate-400">
          <span>{cat}</span>
          <span className="font-mono">
            {formatPrice(info.price)} / {formatPrice(info.budget)}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-slate-800">
          <div
            className={`h-full ${info.used ? 'bg-cyan-400' : 'bg-amber-400'}`}
            style={{ width: `${Math.min(100, (info.price / info.budget) * 100)}%` }}
          />
        </div>
      </div>
    ));
  }, [result]);

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-card-gradient p-5 shadow-glow">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-cyan-300">智能推荐</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          告诉我们你的预算和用途，AI 一键生成高性价比配置
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* 预算 */}
        <div>
          <label className="text-xs text-slate-400">预算（元）</label>
          <input
            type="number"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={BUDGET_STEP}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none"
          />
          <input
            type="range"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={BUDGET_STEP}
            value={Math.min(Math.max(budget, BUDGET_MIN), BUDGET_MAX)}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="mt-2 w-full accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>{formatPrice(BUDGET_MIN)}</span>
            <span>{formatPrice(BUDGET_MAX)}</span>
          </div>
        </div>

        {/* 用途 */}
        <div>
          <label className="text-xs text-slate-400">主要用途</label>
          <select
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none"
          >
            {USAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* 品牌 */}
        <div>
          <label className="text-xs text-slate-400">CPU/主板 品牌偏好</label>
          <div className="mt-1 flex gap-2">
            {BRAND_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setBrand(o.value)}
                className={`flex-1 rounded-md border px-3 py-2 text-sm transition
                  ${
                    brand === o.value
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-glow'
                      : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-cyan-500/50'
                  }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={handleGenerate}
          className="rounded-md bg-gradient-to-r from-cyan-500 to-accent-500 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-glow transition hover:from-cyan-400 hover:to-accent-400"
        >
          ⚡ 一键生成配置
        </button>
        {result && (
          <button
            onClick={handleApply}
            className="rounded-md border border-cyan-400/60 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20"
          >
            应用到我的配置单
          </button>
        )}
        <div className="ml-auto text-xs text-slate-400">
          预计总价：<span className="font-mono text-cyan-300 text-sm">
            {formatPrice(result?.total)}
          </span>
        </div>
      </div>

      {/* 预算分配预览 */}
      {result && (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3 space-y-1.5">
            <div className="text-xs font-semibold text-slate-300 mb-1">预算分配（用途：{result.report.purpose}）</div>
            {ratioBars}
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3 text-xs text-slate-300 space-y-1">
            <div className="font-semibold mb-1">推荐结果摘要</div>
            {Object.entries(result.build).map(([cat, part]) => (
              <div key={cat} className="flex justify-between gap-2">
                <span className="text-slate-500 shrink-0">{cat}</span>
                <span className="truncate text-slate-200 text-right">{part?.name || '-'}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-slate-700 pt-1.5">
              <span className="text-slate-400">合计</span>
              <span className="font-mono text-cyan-300">{formatPrice(result.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
