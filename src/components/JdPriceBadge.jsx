/**
 * 京东价徽章
 * 四种数据来源：
 *  - imported: 用户在 UI 粘贴的 → "JD·真实"
 *  - cache: 本地缓存文件（npm run fetch-prices 抓的）→ "JD·缓存"
 *  - jd: 京东 API 实时 → "JD"
 *  - mock / mock-fallback: 演示数据 → "演示"
 */
import { formatPrice } from '../api/jd.js';

const STATES = {
  idle: { text: '本地参考价', cls: 'text-slate-500' },
  loading: { text: '正在获取京东价…', cls: 'text-slate-400 animate-pulse' },
  success: { text: '京东实时', cls: 'text-rose-400' },
  unavailable: { text: '暂无京东价', cls: 'text-slate-500' },
  error: { text: '京东价获取失败', cls: 'text-amber-400' }
};

export default function JdPriceBadge({ state, jdPrice, originalPrice, promotion, source = 'jd', size = 'sm' }) {
  const meta = STATES[state] || STATES.idle;
  const sizeCls = size === 'lg' ? 'text-sm' : 'text-xs';

  const isImported = source === 'imported' || source.startsWith('imported-partial');
  const isCache = source === 'cache' || source.startsWith('cache+');
  const isMock = source.startsWith('mock');
  const variant = isImported ? 'emerald' : isCache ? 'cyan' : isMock ? 'amber' : 'rose';
  const variantCls = {
    emerald: 'border-emerald-500/40 bg-emerald-500/10',
    cyan: 'border-cyan-500/40 bg-cyan-500/10',
    amber: 'border-amber-500/40 bg-amber-500/10',
    rose: 'border-rose-500/30 bg-rose-500/5'
  }[variant];
  const tagText = isImported ? 'JD·真实' : isCache ? 'JD·缓存' : isMock ? '演示' : 'JD';
  const tagColor = isImported ? 'text-emerald-300' : isCache ? 'text-cyan-300' : isMock ? 'text-amber-400' : 'text-rose-400';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono ${sizeCls} ${variantCls} ${meta.cls}`}
      title={
        state === 'success' && promotion
          ? `促销：${promotion}`
          : state === 'success' && originalPrice && originalPrice > jdPrice
          ? `原价 ${formatPrice(originalPrice)}`
          : isImported
          ? '用户导入的真实京东价格'
          : isCache
          ? '来自本地缓存（运行 npm run fetch-prices 抓取）'
          : isMock
          ? '当前网络不可达京东，展示的是演示数据'
          : '京东 (JD.COM) 实时价格'
      }
    >
      <span className={`font-bold ${tagColor}`}>{tagText}</span>
      {state === 'success' ? (
        <span className="font-semibold">{formatPrice(jdPrice)}</span>
      ) : (
        <span>{meta.text}</span>
      )}
    </span>
  );
}
