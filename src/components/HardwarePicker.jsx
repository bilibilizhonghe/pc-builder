/**
 * 硬件选择弹窗
 * - 多种排序方式：默认 / 品牌分组 / 由新到旧 / 价格升降 / 京东价命中
 * - 兼容现有兼容性检查
 * - 内部调用 useJdPrices，弹窗打开时拉取当前分类所有硬件的京东价
 * - 标签展示：年份/类型/京东价命中
 */
import { useMemo, useState } from 'react';
import { CATEGORY_LABELS } from '../data/hardware.js';
import { getByCategory } from '../data/hardware.js';
import { checkSinglePartCompatibility } from '../utils/compatibility.js';
import { formatPrice } from '../utils/recommender.js';
import { resolveJdSkus } from '../utils/jdSkuStorage.js';
import { useJdPrices } from '../hooks/useJdPrices.js';

/** 排序方式配置（品牌筛选独立，不在此处） */
const SORT_OPTIONS = [
  { value: 'default',   label: '默认',     icon: '📋', desc: '按数据库原始顺序' },
  { value: 'newest',    label: '由新到旧', icon: '✨', desc: '2024/2025 新品在前，经典款独立分组' },
  { value: 'priceAsc',  label: '价格 ↑',   icon: '💰', desc: '便宜到贵' },
  { value: 'priceDesc', label: '价格 ↓',   icon: '💎', desc: '贵到便宜' },
  { value: 'jdHit',     label: '京东价命中', icon: '🎯', desc: '已抓取真实价格优先' }
];

/** 品牌排序权重：Intel/AMD/NVIDIA 三大主力在前，通用最末 */
const BRAND_ORDER = { Intel: 0, AMD: 1, NVIDIA: 2, 通用: 3 };
const BRAND_COLORS = {
  Intel:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/50',   text: 'text-blue-300' },
  AMD:     { bg: 'bg-rose-500/10',    border: 'border-rose-500/50',    text: 'text-rose-300' },
  NVIDIA:  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', text: 'text-emerald-300' },
  通用:    { bg: 'bg-slate-500/10',   border: 'border-slate-500/50',   text: 'text-slate-300' }
};
function brandSortKey(brand) {
  return BRAND_ORDER[brand] ?? 99;
}

/** 从 tags 中提取最大年份（2024/2025 之类）；返回 0 表示经典款 */
function extractYear(part) {
  if (!part.tags) return 0;
  let max = 0;
  for (const t of part.tags) {
    const m = String(t).match(/(20\d{2})/);
    if (m) {
      const y = parseInt(m[1], 10);
      if (y > max) max = y;
    }
  }
  return max;
}

/** 从 tags 中取出"非年份"分类标签（如"旗舰/主流/性价比"） */
function extractEraTags(part) {
  if (!part.tags) return [];
  return part.tags.filter((t) => !/^20\d{2}$/.test(t));
}

/** 生成"类型徽章"：散热器 风冷/水冷；内存 DDR 代际；其他分类返回 null */
function TypeBadge({ category, part }) {
  if (category === 'cooler' && part?.specs?.type) {
    if (part.specs.type === 'Air') {
      return (
        <span className="rounded border border-sky-500/40 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">
          🌬️ 风冷
        </span>
      );
    }
    if (part.specs.type === 'AIO') {
      return (
        <span className="rounded border border-violet-500/40 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-bold text-violet-300">
          💧 一体水冷
        </span>
      );
    }
  }
  if (category === 'ram' && part?.specs?.type) {
    const ddrColor =
      part.specs.type === 'DDR5'
        ? 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300'
        : part.specs.type === 'DDR4'
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
        : 'border-slate-500/40 bg-slate-500/10 text-slate-300';
    return (
      <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold font-mono ${ddrColor}`}>
        {part.specs.type}
      </span>
    );
  }
  return null;
}

export default function HardwarePicker({ category, currentBuild, onSelect, onClose }) {
  const list = useMemo(() => getByCategory(category), [category]);
  const title = CATEGORY_LABELS[category] || '选择硬件';
  const [sortBy, setSortBy] = useState('default');
  // 品牌筛选（空数组 = 不筛选；非空 = 仅显示选中品牌）
  const [selectedBrands, setSelectedBrands] = useState([]);

  // 当前分类下所有硬件的京东价（按 part.id 索引）
  const skuList = useMemo(
    () => list.map((p) => {
      const sku = resolveJdSkus([p.id])[p.id];
      return sku;
    }).filter(Boolean),
    [list]
  );
  const { priceMap: skuPriceMap } = useJdPrices(skuList);
  // 转成 part.id → {price, ...}
  const partPriceMap = useMemo(() => {
    const m = {};
    for (const p of list) {
      const sku = resolveJdSkus([p.id])[p.id];
      if (sku && skuPriceMap[sku]) {
        m[p.id] = skuPriceMap[sku];
      }
    }
    return m;
  }, [list, skuPriceMap]);

  // === 各品牌计数（用于筛选 chip 显示）===
  const brandCounts = useMemo(() => {
    const m = {};
    for (const p of list) m[p.brand] = (m[p.brand] || 0) + 1;
    return m;
  }, [list]);
  const availableBrands = useMemo(
    () => Object.keys(brandCounts).sort((a, b) => brandSortKey(a) - brandSortKey(b)),
    [brandCounts]
  );

  // === 先按品牌筛选，再按当前排序 ===
  const filtered = useMemo(() => {
    if (selectedBrands.length === 0) return list;
    return list.filter((p) => selectedBrands.includes(p.brand));
  }, [list, selectedBrands]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case 'priceAsc':
        return arr.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return arr.sort((a, b) => b.price - a.price);
      case 'jdHit': {
        // 命中真实价优先；同命中状态按价格降序
        const score = (p) => (partPriceMap[p.id] ? 1 : 0);
        return arr.sort((a, b) => {
          const sa = score(a), sb = score(b);
          if (sa !== sb) return sb - sa;
          return b.price - a.price;
        });
      }
      case 'newest':
        return arr.sort((a, b) => {
          const ya = extractYear(a), yb = extractYear(b);
          if (ya !== yb) return yb - ya;
          return b.price - a.price;
        });
      case 'default':
      default:
        return arr;
    }
  }, [filtered, sortBy, partPriceMap]);

  // === "由新到旧" 分组：经典款独立尾部 ===
  const newestGroups = useMemo(() => {
    if (sortBy !== 'newest') return null;
    const byYear = new Map();
    for (const part of sorted) {
      const y = extractYear(part);
      const key = y > 0 ? String(y) : 'classic';
      if (!byYear.has(key)) byYear.set(key, []);
      byYear.get(key).push(part);
    }
    // 年份倒序，classic 排最后
    return [...byYear.entries()].sort((a, b) => {
      if (a[0] === 'classic') return 1;
      if (b[0] === 'classic') return -1;
      return parseInt(b[0]) - parseInt(a[0]);
    });
  }, [sorted, sortBy]);

  // 切换品牌选中（多选）
  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };
  const clearBrands = () => setSelectedBrands([]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-cyan-500/20 bg-card-gradient shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-cyan-300">选择 · {title}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.desc}
              {selectedBrands.length > 0 && (
                <span className="ml-2 text-cyan-300">
                  · 已筛选 {selectedBrands.join(' / ')}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 hover:bg-slate-700/40 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* 品牌筛选器（多选 chip） */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-700/50 bg-slate-900/30 px-6 py-3">
          <span className="text-xs text-slate-500">品牌：</span>

          {/* 全部按钮 */}
          <button
            onClick={clearBrands}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition
              ${
                selectedBrands.length === 0
                  ? 'bg-cyan-500 text-slate-900 shadow-glow'
                  : 'border border-slate-700 bg-slate-800/40 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300'
              }`}
          >
            全部 <span className="ml-1 font-mono opacity-70">({list.length})</span>
          </button>

          {/* 各品牌 chip */}
          {availableBrands.map((brand) => {
            const active = selectedBrands.includes(brand);
            const colors = BRAND_COLORS[brand] || BRAND_COLORS.通用;
            const count = brandCounts[brand] || 0;
            return (
              <button
                key={brand}
                onClick={() => toggleBrand(brand)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition
                  ${
                    active
                      ? `${colors.bg} ${colors.border} ${colors.text} shadow-glow`
                      : 'border border-slate-700 bg-slate-800/40 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300'
                  }`}
              >
                {active && '✓ '}
                {brand}
                <span className="ml-1 font-mono opacity-70">({count})</span>
              </button>
            );
          })}

          {selectedBrands.length > 0 && (
            <button
              onClick={clearBrands}
              className="text-[10px] text-slate-500 hover:text-rose-300 ml-1"
            >
              ✕ 清空筛选
            </button>
          )}
        </div>

        {/* 排序工具栏 */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-700/50 bg-slate-900/30 px-6 py-3">
          <span className="text-xs text-slate-500">排序：</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition
                ${
                  sortBy === opt.value
                    ? 'bg-cyan-500 text-slate-900 shadow-glow'
                    : 'border border-slate-700 bg-slate-800/40 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300'
                }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500">
            命中 <span className="font-mono text-cyan-300">{sorted.length}</span>
            <span className="text-slate-600"> / {list.length}</span> 件
          </span>
        </div>

        {/* 列表 */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4 space-y-4">
          {/* 空状态：被筛选过滤光 */}
          {sorted.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 px-4 py-10 text-center text-sm text-slate-500">
              当前筛选条件下没有匹配的硬件
              <div className="mt-2 text-xs">
                <button
                  onClick={clearBrands}
                  className="text-cyan-300 hover:underline"
                >
                  ← 清空品牌筛选
                </button>
              </div>
            </div>
          )}

          {/* 由新到旧模式（经典款独立） */}
          {newestGroups && sorted.length > 0 && (
            <div className="space-y-5">
              {newestGroups.map(([yearKey, parts]) => (
                <div key={yearKey}>
                  <div className="mb-2 flex items-center gap-2 sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm py-2">
                    {yearKey === 'classic' ? (
                      <span className="rounded border border-slate-500/40 bg-slate-700/30 px-2 py-0.5 text-xs font-bold text-slate-300">
                        经典款
                      </span>
                    ) : (
                      <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-300">
                        {yearKey} 新品
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500">{parts.length} 件</span>
                  </div>
                  <div className="space-y-3">
                    {parts.map((part) => (
                      <HardwareRow
                        key={part.id}
                        part={part}
                        category={category}
                        currentBuild={currentBuild}
                        onSelect={onSelect}
                        partPriceMap={partPriceMap}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 默认 / 价格 / 京东价命中模式 */}
          {!newestGroups && sorted.map((part) => (
            <HardwareRow
              key={part.id}
              part={part}
              category={category}
              currentBuild={currentBuild}
              onSelect={onSelect}
              partPriceMap={partPriceMap}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** 单个硬件卡片行 */
function HardwareRow({ part, category, currentBuild, onSelect, partPriceMap = {} }) {
  const conflicts = checkSinglePartCompatibility(part, currentBuild);
  const hasConflict = conflicts.length > 0;
  const year = extractYear(part);
  const eraTags = extractEraTags(part);
  const jdHit = partPriceMap[part.id];

  return (
    <div
      className={`group flex items-center justify-between gap-4 rounded-xl border p-4 transition
        ${
          hasConflict
            ? 'border-red-500/40 bg-red-500/5'
            : 'border-slate-700 bg-slate-800/40 hover:border-cyan-500/60 hover:bg-slate-800/70 hover:shadow-glow'
        }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold text-slate-100">{part.name}</span>
          <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-300">
            {part.brand}
          </span>
          {/* 类型徽章：散热器（风冷/水冷）+ 内存（DDR 代际） */}
          <TypeBadge category={category} part={part} />
          {year > 0 && (
            <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
              {year}
            </span>
          )}
          {jdHit && (
            <span className="rounded border border-cyan-500/40 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
              🎯 ¥{jdHit.price}
            </span>
          )}
          {eraTags.slice(0, 3).map((t) => (
            <span key={t} className="rounded border border-slate-600 bg-slate-700/40 px-1.5 py-0.5 text-[10px] text-slate-300">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 font-mono">
          {Object.entries(part.specs).map(([k, v]) => (
            <span key={k}>
              {k}: <span className="text-slate-200">{String(v)}</span>
            </span>
          ))}
        </div>

        {hasConflict && (
          <div className="mt-2 text-xs text-red-300">{conflicts[0]}</div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="text-lg font-bold text-cyan-300">{formatPrice(part.price)}</div>
        <button
          disabled={hasConflict}
          onClick={() => onSelect(part)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition
            ${
              hasConflict
                ? 'cursor-not-allowed bg-slate-700 text-slate-500'
                : 'bg-cyan-500 text-slate-900 hover:bg-cyan-400 shadow-glow'
            }`}
        >
          {hasConflict ? '不兼容' : '加入配置'}
        </button>
      </div>
    </div>
  );
}
