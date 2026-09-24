/**
 * 真实价格导入弹窗
 * - 提供 curl 复制按钮，让用户在能联网的环境抓 p.3.cn
 * - 粘贴抓回的 JSON → 解析 → 预览 → 导入到 localStorage
 * - 列出已导入的所有 SKU
 */
import { useState, useMemo } from 'react';
import { useBuildStore } from '../store/useBuildStore.js';
import { CATEGORIES, CATEGORY_LABELS } from '../data/hardware.js';
import { resolveJdSkus } from '../utils/jdSkuStorage.js';
import {
  parsePriceJson,
  loadImportedPrices,
  saveImportedPrices,
  removeImportedPrice,
  clearImportedPrices,
  buildFetchUrl,
  buildCurlCommand
} from '../utils/jdPriceImporter.js';
import { formatPrice } from '../api/jd.js';

export default function JdPriceImporter({ open, onClose }) {
  const build = useBuildStore((s) => s.build);
  const [imported, setImported] = useState(loadImportedPrices);
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [toast, setToast] = useState(null);

  // 当前配置单的所有 SKU
  const skuList = useMemo(() => {
    const ids = CATEGORIES.map((c) => build[c]?.id).filter(Boolean);
    return Object.values(resolveJdSkus(ids)).filter(Boolean);
  }, [build]);

  const showToast = (t, kind = 'ok') => {
    setToast({ text: t, kind });
    setTimeout(() => setToast(null), 2400);
  };

  const handleParse = () => {
    if (!text.trim()) {
      showToast('请粘贴抓取到的 JSON 数据', 'err');
      return;
    }
    const result = parsePriceJson(text);
    setParsed(result);
    if (result.ok) {
      showToast(`解析成功：${result.items.length} 项`, 'ok');
    } else {
      showToast('解析失败，请检查 JSON 格式', 'err');
    }
  };

  const handleImport = () => {
    if (!parsed || !parsed.items.length) {
      showToast('没有可导入的数据', 'err');
      return;
    }
    const n = saveImportedPrices(parsed.items);
    setImported(loadImportedPrices());
    setText('');
    setParsed(null);
    showToast(`已导入 ${n} 条真实价格`, 'ok');
  };

  const handleCopyFetchUrl = async () => {
    const url = buildFetchUrl(skuList);
    try {
      await navigator.clipboard.writeText(url);
      showToast('已复制抓取 URL', 'ok');
    } catch {
      // 降级方案
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast('已复制抓取 URL', 'ok');
      } catch {
        showToast('复制失败，请手动复制下方文本', 'err');
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const handleCopyCurl = async () => {
    const cmd = buildCurlCommand(skuList);
    try {
      await navigator.clipboard.writeText(cmd);
      showToast('已复制 curl 命令', 'ok');
    } catch {
      showToast('复制失败', 'err');
    }
  };

  const handleRemove = (sku) => {
    removeImportedPrice(sku);
    setImported(loadImportedPrices());
  };

  const handleClearAll = () => {
    if (!confirm('确认清空所有已导入的真实价格？')) return;
    clearImportedPrices();
    setImported({});
    showToast('已清空', 'ok');
  };

  if (!open) return null;

  const importedList = Object.entries(imported).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-cyan-500/20 bg-card-gradient shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cyan-500/20 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-cyan-300">导入京东真实价格</h2>
            <p className="text-xs text-slate-400 mt-1">
              在能联网的环境抓 p.3.cn → 粘贴到此处 → 永久生效
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 hover:bg-slate-700/40 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 px-6 py-4 max-h-[75vh] overflow-y-auto">
          {/* 步骤 1：获取 curl */}
          <section className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
            <h3 className="text-sm font-semibold text-cyan-200 mb-2">
              步骤 1 · 在能联网的环境执行抓取
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              当前配置单中 <span className="font-mono text-cyan-300">{skuList.length}</span> 个硬件已绑定 SKU。
              点击下方按钮复制抓取命令，然后在能访问京东网络的终端/Postman 中执行：
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopyFetchUrl}
                disabled={skuList.length === 0}
                className="rounded-md bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                📋 复制抓取 URL
              </button>
              <button
                onClick={handleCopyCurl}
                disabled={skuList.length === 0}
                className="rounded-md border border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🐚 复制 curl 命令
              </button>
            </div>
            {skuList.length === 0 && (
              <p className="mt-2 text-[11px] text-amber-300">
                提示：先选择至少一个硬件以生成抓取命令
              </p>
            )}
          </section>

          {/* 步骤 2：粘贴并解析 */}
          <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-2">
              步骤 2 · 粘贴抓取结果
            </h3>
            <p className="text-xs text-slate-400 mb-2">
              支持以下三种格式（任选其一）：
            </p>
            <ul className="text-[11px] text-slate-500 font-mono space-y-1 mb-3">
              <li>① p.3.cn 原生：<code>[{`{id:"J_xxx",p:"1234",op:"1399",cpr:"..."}`}]</code></li>
              <li>② 简化对象：<code>{`{"100012345":{price:1234,originalPrice:1399}}`}</code></li>
              <li>③ 简化数组：<code>[{`{sku:"100012345",price:1234,originalPrice:1399}`}]</code></li>
            </ul>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='将 curl 输出 / Postman Response 粘贴到此处...'
              rows={5}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleParse}
                className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-400 hover:text-cyan-300"
              >
                🔍 解析
              </button>
              <button
                onClick={handleImport}
                disabled={!parsed?.ok}
                className="rounded-md bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-900 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✅ 导入
              </button>
            </div>

            {parsed && (
              <div className="mt-3 space-y-2">
                {parsed.errors.length > 0 && (
                  <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    <div className="font-semibold">解析错误 ({parsed.errors.length})</div>
                    <ul className="list-disc list-inside mt-1 text-[11px] text-red-300/90">
                      {parsed.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                      {parsed.errors.length > 5 && <li>...还有 {parsed.errors.length - 5} 条</li>}
                    </ul>
                  </div>
                )}
                {parsed.items.length > 0 && (
                  <div className="rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                    <div className="font-semibold">解析成功 {parsed.items.length} 项</div>
                    <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 font-mono text-[11px]">
                      {parsed.items.slice(0, 8).map((it) => (
                        <div key={it.sku} className="text-emerald-100/80">
                          J_{it.sku} → {formatPrice(it.price)}
                        </div>
                      ))}
                      {parsed.items.length > 8 && <div className="text-emerald-100/60">...还有 {parsed.items.length - 8} 项</div>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {toast && (
              <div
                className={`mt-2 rounded px-3 py-1.5 text-xs ${
                  toast.kind === 'err'
                    ? 'bg-red-500/10 text-red-200'
                    : 'bg-cyan-500/10 text-cyan-200'
                }`}
              >
                {toast.text}
              </div>
            )}
          </section>

          {/* 步骤 3：已导入列表 */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">
                已导入 ({importedList.length})
              </h3>
              {importedList.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-slate-400 hover:text-red-300"
                >
                  清空全部
                </button>
              )}
            </div>
            {importedList.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 px-4 py-6 text-center text-xs text-slate-500">
                尚未导入任何真实价格。导入后将按 "JD 真实" 展示。
              </div>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {importedList.map(([sku, data]) => (
                  <div
                    key={sku}
                    className="flex items-center justify-between gap-2 rounded border border-emerald-500/30 bg-emerald-500/5 px-3 py-1.5 text-xs"
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-3">
                      <span className="font-mono text-emerald-200">J_{sku}</span>
                      <span className="font-mono text-rose-300 font-semibold">{formatPrice(data.price)}</span>
                      {data.originalPrice > data.price && (
                        <span className="font-mono text-slate-500 line-through text-[11px]">
                          {formatPrice(data.originalPrice)}
                        </span>
                      )}
                      {data.promotion && (
                        <span className="text-[10px] text-amber-300/80 truncate">{data.promotion}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(sku)}
                      className="rounded p-1 text-slate-500 hover:bg-red-500/20 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
