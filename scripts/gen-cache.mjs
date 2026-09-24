/**
 * 一键生成完整价格缓存（基于 SKU 末位伪随机）
 * 用法：node scripts/gen-cache.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// 读取 SKU 映射
const skuMapPath = path.join(PROJECT_ROOT, 'src/data/jdSkuMap.js');
const skuMapText = fs.readFileSync(skuMapPath, 'utf-8');
const m = skuMapText.match(/export const JD_SKU_DEMO\s*=\s*({[\s\S]*?})\s*;?\s*$/m);
const obj = new Function(`return (${m[1]});`)();

// 生成缓存
const cache = { _generatedAt: Date.now(), _comment: '自动生成。运行 npm run fetch-prices 替换为真实抓取数据' };
const ts = 1736073600000;

for (const [hardwareId, sku] of Object.entries(obj)) {
  if (!sku) continue;
  // 基于硬件 ID 和 SKU 生成稳定的"真实化"价格
  let h = 0;
  for (let i = 0; i < hardwareId.length; i++) h = (h * 31 + hardwareId.charCodeAt(i)) >>> 0;
  // 价格区间基于硬件类型（粗略映射，可后续替换为真实数据）
  const base = 200 + (h % 10000); // 200~10200
  const discountPct = 5 + (h % 15); // 5~19%
  const price = Math.round(base * (1 - discountPct / 100) / 5) * 5;
  const originalPrice = base;
  const promotion = discountPct >= 12 ? `每满1000减${Math.round(discountPct * 10)}` : '';
  cache[sku] = { sku, price, originalPrice, promotion, fetchedAt: ts };
}

const outPath = path.join(PROJECT_ROOT, 'data/jd-prices-cache.json');
fs.writeFileSync(outPath, JSON.stringify(cache, null, 2));
console.log(`已生成 ${Object.keys(cache).length - 2} 条价格到 ${outPath}`);
