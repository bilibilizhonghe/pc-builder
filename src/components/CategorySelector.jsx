/**
 * 分类硬件选择区（左侧主体上半部分）
 * 8 个分类依次展示：
 *  - 未选：显示"选择"按钮
 *  - 已选：显示名称、参数、价格，并可删除
 *  - 附加：每个硬件展示京东实时价徽章
 */
import { useMemo } from 'react';
import { useBuildStore } from '../store/useBuildStore.js';
import { CATEGORIES, CATEGORY_LABELS } from '../data/hardware.js';
import { resolveJdSkus } from '../utils/jdSkuStorage.js';
import { formatPrice } from '../utils/recommender.js';
import { useJdPrices } from '../hooks/useJdPrices.js';
import JdPriceBadge from './JdPriceBadge.jsx';

const ICONS = {
  cpu: '🧠',
  motherboard: '🧩',
  gpu: '🎮',
  ram: '💾',
  storage: '📀',
  psu: '⚡',
  case: '📦',
  cooler: '❄️',
  fan: '🌀'
};

export default function CategorySelector() {
  const build = useBuildStore((s) => s.build);
  const openPicker = useBuildStore((s) => s.openPicker);
  const removePart = useBuildStore((s) => s.removePart);

  // 收集所有已选硬件的京东 SKU（优先用户 localStorage 覆盖，其次默认映射）
  const partIds = useMemo(
    () => CATEGORIES.map((cat) => build[cat]?.id).filter(Boolean),
    [build]
  );
  const skuMap = useMemo(() => resolveJdSkus(partIds), [partIds]);
  const skuList = useMemo(() => Object.values(skuMap).filter(Boolean), [skuMap]);
  const { priceMap, states, isMock, isImported, source } = useJdPrices(skuList);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {CATEGORIES.map((cat) => {
        const part = build[cat];
        const jdSku = part ? skuMap[part.id] : null;
        const jdState = jdSku ? states[jdSku] || 'loading' : 'idle';
        const jdData = jdSku ? priceMap[jdSku] : null;
        return (
          <div
            key={cat}
            className={`relative overflow-hidden rounded-xl border p-4 transition
              ${
                part
                  ? 'border-cyan-500/40 bg-slate-800/60 shadow-glow'
                  : 'border-dashed border-slate-600 bg-slate-900/40 hover:border-cyan-500/40'
              }`}
          >
            {/* 装饰渐变条 */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl" />

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{ICONS[cat]}</span>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400">
                    {CATEGORY_LABELS[cat]}
                  </div>
                  {part ? (
                    <div className="text-sm font-semibold text-slate-100">{part.name}</div>
                  ) : (
                    <div className="text-sm text-slate-500">尚未选择</div>
                  )}
                </div>
              </div>
            </div>

            {part ? (
              <div className="mt-3 space-y-2">
                {/* 关键参数 */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono">
                  {Object.entries(part.specs)
                    .slice(0, 4)
                    .map(([k, v]) => (
                      <span key={k}>
                        {k}: <span className="text-slate-200">{String(v)}</span>
                      </span>
                    ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-bold text-cyan-300">{formatPrice(part.price)}</span>
                    {/* 京东价徽章 */}
                    {jdSku ? (
                      <JdPriceBadge
                        state={jdState}
                        jdPrice={jdData?.price}
                        originalPrice={jdData?.originalPrice}
                        promotion={jdData?.promotion}
                        source={source}
                      />
                    ) : (
                      <span className="text-[10px] text-slate-600">未绑定京东 SKU</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openPicker(cat)}
                      className="rounded-md border border-slate-600 px-2.5 py-1 text-xs text-slate-200 hover:border-cyan-400 hover:text-cyan-300"
                    >
                      更换
                    </button>
                    <button
                      onClick={() => removePart(cat)}
                      className="rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/20"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openPicker(cat)}
                className="mt-3 w-full rounded-md border border-cyan-500/30 bg-cyan-500/5 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/15 hover:shadow-glow"
              >
                + 选择{CATEGORY_LABELS[cat]}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
