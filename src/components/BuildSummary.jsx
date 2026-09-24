/**
 * 实时配置单（右侧栏）
 * - 列出已选硬件
 * - 实时总价（京东价 > 本地价）
 * - 兼容性问题提示
 * - 一键清空、刷新京东价
 */
import { useMemo } from 'react';
import { useBuildStore, selectSelectedCount, selectCompatibility } from '../store/useBuildStore.js';
import { CATEGORIES, CATEGORY_LABELS } from '../data/hardware.js';
import { resolveJdSkus } from '../utils/jdSkuStorage.js';
import { formatPrice } from '../utils/recommender.js';
import { useJdPrices } from '../hooks/useJdPrices.js';
import CompatibilityWarning from './CompatibilityWarning.jsx';
import JdPriceBadge from './JdPriceBadge.jsx';

export default function BuildSummary({ onOpenBinder, onOpenImporter }) {
  const build = useBuildStore((s) => s.build);
  const removePart = useBuildStore((s) => s.removePart);
  const clearBuild = useBuildStore((s) => s.clearBuild);
  const count = useBuildStore(selectSelectedCount);
  const compat = useBuildStore(selectCompatibility);

  // 已选硬件的京东 SKU（优先用户 localStorage 覆盖）
  const partIds = useMemo(
    () => CATEGORIES.map((cat) => build[cat]?.id).filter(Boolean),
    [build]
  );
  const skuMap = useMemo(() => resolveJdSkus(partIds), [partIds]);
  const skuList = useMemo(() => Object.values(skuMap).filter(Boolean), [skuMap]);
  const { priceMap, states, loading, refresh, lastFetchAt, isMock, isImported, isCache, isVerified, source } = useJdPrices(skuList);

  // 京东价合计（缺失的部分用本地价兜底）
  const jdTotal = useMemo(() => {
    return CATEGORIES.reduce((sum, cat) => {
      const part = build[cat];
      if (!part) return sum;
      const sku = skuMap[part.id];
      const jd = sku ? priceMap[sku] : null;
      return sum + (jd?.price ?? part.price);
    }, 0);
  }, [build, priceMap, skuMap]);

  // 本地价合计（永远可用）
  const localTotal = useMemo(
    () => CATEGORIES.reduce((sum, cat) => sum + (build[cat]?.price ?? 0), 0),
    [build]
  );

  const jdCount = skuList.filter((sku) => priceMap[sku]?.price).length;
  const isCacheMixed = source.startsWith('cache');

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-cyan-500/20 bg-card-gradient p-5 shadow-glow">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-cyan-300">我的配置单</h2>
          <p className="text-xs text-slate-400 mt-0.5">实时同步 · 京东价自动校验</p>
        </div>
        <div className="flex gap-2">
          {onOpenImporter && (
            <button
              onClick={onOpenImporter}
              title="导入真实京东价格 JSON"
              className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20"
            >
              导入真实价
            </button>
          )}
          {onOpenBinder && (
            <button
              onClick={onOpenBinder}
              title="管理京东商品绑定"
              className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-300 hover:bg-amber-500/20"
            >
              绑定京东SKU
            </button>
          )}
          <button
            onClick={refresh}
            disabled={loading || skuList.length === 0}
            className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '刷新中…' : '刷新京东价'}
          </button>
          <button
            onClick={clearBuild}
            disabled={count === 0}
            className="rounded-md border border-slate-600 px-3 py-1 text-xs text-slate-300 hover:border-red-400 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            清空
          </button>
        </div>
      </div>

      {/* 配件列表 */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {CATEGORIES.map((cat) => {
          const part = build[cat];
          const sku = part ? skuMap[part.id] : null;
          const jd = sku ? priceMap[sku] : null;
          return (
            <div
              key={cat}
              className={`group flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm
                ${
                  part
                    ? 'border-slate-700 bg-slate-800/40'
                    : 'border-dashed border-slate-800 bg-slate-900/30'
                }`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">
                  {CATEGORY_LABELS[cat]}
                </div>
                {part ? (
                  <div className="truncate text-slate-100">{part.name}</div>
                ) : (
                  <div className="text-slate-600">— 待选 —</div>
                )}
              </div>
              {part && (
                <div className="flex items-center gap-2">
                  {/* 显示京东价（如有），否则显示本地价 */}
                  <div className="text-right">
                    {jd?.price ? (
                      <>
                        <div
                          className={`font-mono text-sm font-semibold ${
                            isImported ? 'text-emerald-300'
                            : isCache ? 'text-cyan-300'
                            : isMock ? 'text-amber-300'
                            : 'text-rose-300'
                          }`}
                        >
                          {formatPrice(jd.price)}
                        </div>
                        {jd.originalPrice > jd.price && (
                          <div className="font-mono text-slate-500 text-[10px] line-through">
                            {formatPrice(jd.originalPrice)}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="font-mono text-cyan-300 text-sm">{formatPrice(part.price)}</div>
                    )}
                  </div>
                  <button
                    onClick={() => removePart(cat)}
                    className="rounded p-1 text-slate-500 hover:bg-red-500/20 hover:text-red-300"
                    title="移除"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 总价区域 */}
      <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/5 p-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-slate-400">已选配件</div>
            <div className="text-2xl font-bold text-slate-100">
              {count}
              <span className="text-sm text-slate-500"> / {CATEGORIES.length}</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              京东价命中 {jdCount} / {skuList.length}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">
              {isImported ? '京东真实总价' : isCache ? '京东缓存总价' : '京东实时总价'}
            </div>
            <div
              className={`text-3xl font-extrabold font-mono ${
                isImported ? 'text-emerald-300'
                : isCache ? 'text-cyan-300'
                : 'text-rose-300'
              }`}
            >
              {formatPrice(jdTotal)}
            </div>
            {jdTotal !== localTotal && (
              <div className="text-[10px] text-slate-500 line-through font-mono">
                本地 {formatPrice(localTotal)}
              </div>
            )}
          </div>
        </div>
        {lastFetchAt && (
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">
              上次同步：{new Date(lastFetchAt).toLocaleTimeString('zh-CN')}
            </span>
            {isImported ? (
              <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-emerald-300">
                真实价（UI 导入）
              </span>
            ) : isCache ? (
              <span className="rounded border border-cyan-500/40 bg-cyan-500/10 px-1.5 py-0.5 text-cyan-300">
                本地缓存（npm run fetch-prices）
              </span>
            ) : isMock ? (
              <span className="rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-amber-300">
                演示数据（京东不可达）
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* 兼容性 */}
      <CompatibilityWarning compatibility={compat} />
    </div>
  );
}
