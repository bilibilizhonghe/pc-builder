/**
 * 京东链接绑定组件
 * - 粘贴京东商品链接 → 自动提取 SKU → 保存到 localStorage
 * - 列表展示所有已绑定项，支持解除绑定
 */
import { useState, useMemo } from 'react';
import { HARDWARE_DB, CATEGORY_LABELS } from '../data/hardware.js';
import { JD_SKU_DEMO } from '../data/jdSkuMap.js';
import {
  extractJdSku,
  loadJdOverrides,
  saveJdSkuBinding,
  removeJdSkuBinding
} from '../utils/jdSkuStorage.js';

export default function JdLinkBinder({ open, onClose }) {
  const [overrides, setOverrides] = useState(loadJdOverrides);
  const [url, setUrl] = useState('');
  const [pickId, setPickId] = useState('');
  const [toast, setToast] = useState(null);

  // 当前硬件清单（用于下拉选择绑定目标）
  const parts = useMemo(() => HARDWARE_DB, []);

  const showToast = (text, kind = 'ok') => {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 2200);
  };

  const handleBind = () => {
    if (!url.trim() || !pickId) {
      showToast('请填写链接并选择硬件', 'err');
      return;
    }
    const sku = extractJdSku(url);
    if (!sku) {
      showToast('未识别到京东 SKU，请检查链接格式', 'err');
      return;
    }
    saveJdSkuBinding(pickId, sku);
    setOverrides(loadJdOverrides());
    setUrl('');
    showToast(`已绑定：${pickId} → J_${sku}`, 'ok');
  };

  const handleRemove = (id) => {
    removeJdSkuBinding(id);
    setOverrides(loadJdOverrides());
    showToast(`已解除绑定：${id}`, 'ok');
  };

  const handleReset = () => {
    if (!confirm('确认清空所有自定义京东绑定？')) return;
    Object.keys(overrides).forEach(removeJdSkuBinding);
    setOverrides({});
    showToast('已清空', 'ok');
  };

  if (!open) return null;

  const demoEntries = Object.entries(JD_SKU_DEMO);
  const overrideEntries = Object.entries(overrides);
  const totalBound = demoEntries.filter(([id]) => overrides[id]).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-cyan-500/20 bg-card-gradient shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cyan-500/20 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-cyan-300">京东 SKU 绑定管理</h2>
            <p className="text-xs text-slate-400 mt-1">
              粘贴京东商品链接 → 自动提取 SKU → 实时价格立即生效
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 hover:bg-slate-700/40 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 px-6 py-4 max-h-[70vh] overflow-y-auto">
          {/* 提示 */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200/90">
            <div className="font-semibold mb-1">如何获取京东商品链接：</div>
            <ol className="list-decimal list-inside space-y-0.5 text-amber-100/80">
              <li>打开京东商品页（例如 https://item.jd.com/100012345.html）</li>
              <li>复制浏览器地址栏 URL，或点击商品页"分享"按钮复制</li>
              <li>粘贴到下方输入框，选择对应的硬件型号即可</li>
            </ol>
            <div className="mt-2 text-amber-100/60">
              绑定数据保存在 localStorage；自定义绑定优先于默认映射。
              已绑定 <span className="font-mono text-amber-200">{totalBound}</span> / {demoEntries.length} 项。
            </div>
          </div>

          {/* 绑定输入区 */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="粘贴京东商品链接，例如 https://item.jd.com/100012345.html"
              className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none font-mono"
            />
            <select
              value={pickId}
              onChange={(e) => setPickId(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
            >
              <option value="">-- 选择硬件 --</option>
              {parts.map((p) => (
                <option key={p.id} value={p.id}>
                  [{CATEGORY_LABELS[p.category]}] {p.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleBind}
              className="rounded-md bg-gradient-to-r from-cyan-500 to-accent-500 px-4 py-2 text-sm font-bold text-slate-900 shadow-glow hover:from-cyan-400 hover:to-accent-400"
            >
              绑定
            </button>
          </div>

          {toast && (
            <div
              className={`rounded-md border px-3 py-2 text-xs ${
                toast.kind === 'err'
                  ? 'border-red-500/40 bg-red-500/10 text-red-200'
                  : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
              }`}
            >
              {toast.text}
            </div>
          )}

          {/* 已绑定列表 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">自定义绑定</h3>
              {overrideEntries.length > 0 && (
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-red-300"
                >
                  清空全部
                </button>
              )}
            </div>
            {overrideEntries.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 px-4 py-6 text-center text-xs text-slate-500">
                尚未自定义绑定，所有硬件使用内置默认 SKU
              </div>
            ) : (
              <div className="space-y-1.5">
                {overrideEntries.map(([id, sku]) => {
                  const part = parts.find((p) => p.id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-2 rounded-md border border-cyan-500/30 bg-cyan-500/5 px-3 py-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-slate-200 truncate">{part?.name || id}</div>
                        <div className="text-slate-500 font-mono mt-0.5">
                          J_{sku}
                          <a
                            href={`https://item.jd.com/${sku}.html`}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-2 text-cyan-400 hover:underline"
                          >
                            打开 ↗
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(id)}
                        className="rounded p-1 text-slate-500 hover:bg-red-500/20 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 默认映射（只读预览） */}
          <details className="rounded-lg border border-slate-700 bg-slate-900/30 p-3">
            <summary className="cursor-pointer text-xs text-slate-300 select-none">
              查看内置默认映射（{demoEntries.length} 项）
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2 max-h-48 overflow-y-auto text-[11px] font-mono">
              {demoEntries.map(([id, sku]) => (
                <div
                  key={id}
                  className="flex items-center justify-between text-slate-400 px-2 py-0.5"
                >
                  <span className="truncate">{id}</span>
                  <span className={overrides[id] ? 'text-emerald-400' : 'text-slate-500'}>
                    J_{sku}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
