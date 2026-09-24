/**
 * 京东价格自动抓取脚本
 *
 * 用法：
 *   node scripts/fetch-jd-prices.mjs              # 抓取 jdSkuMap.js 中的所有 SKU
 *   node scripts/fetch-jd-prices.mjs --ids=SKU1,SKU2   # 抓取指定 SKU
 *   node scripts/fetch-jd-prices.mjs --chunk=20  --delay=300   # 自定义分块大小 / 间隔
 *
 * 输出：data/jd-prices-cache.json
 *  - 前端 vite 代理会优先读取这个文件作为"真实价格缓存"
 *  - 用户在能联网的环境运行一次后，dev server 立即可用真实数据
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const JD_PRICE_API = 'https://p.3.cn/prices/mgets';
const JD_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  Referer: 'https://item.jd.com/',
  Accept: '*/*'
};

// 命令行参数
const args = process.argv.slice(2);
const argMap = {};
for (const a of args) {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  if (m) argMap[m[1]] = m[2] ?? true;
}
const CHUNK = parseInt(argMap.chunk || '30', 10);
const DELAY_MS = parseInt(argMap.delay || '200', 10);
const TIMEOUT_MS = parseInt(argMap.timeout || '8000', 10);
const IDS_OVERRIDE = argMap.ids
  ? argMap.ids.split(',').map((s) => s.trim()).filter(Boolean)
  : null;

/**
 * 读取 jdSkuMap.js 中的所有 SKU
 */
async function loadSkuMap() {
  const skuMapPath = path.join(PROJECT_ROOT, 'src/data/jdSkuMap.js');
  const text = fs.readFileSync(skuMapPath, 'utf-8');
  // 简易提取 id->sku 映射（用 eval 比写解析器简单）
  const m = text.match(/export const JD_SKU_DEMO\s*=\s*({[\s\S]*?})\s*;?\s*$/m);
  if (!m) {
    throw new Error('jdSkuMap.js 中未找到 JD_SKU_DEMO');
  }
  // 用 Function 解析对象字面量（避免引入额外依赖）
  // eslint-disable-next-line no-new-func
  const obj = new Function(`return (${m[1]});`)();
  return obj;
}

/**
 * 抓取一组 SKU 的实时价
 */
async function fetchChunk(skus) {
  const skuIds = skus.map((s) => `J_${s}`).join(',');
  const url = `${JD_PRICE_API}?skuIds=${encodeURIComponent(skuIds)}`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { headers: JD_HEADERS, signal: controller.signal });
    if (!r.ok) {
      throw new Error(`HTTP ${r.status}`);
    }
    const arr = await r.json();
    const map = new Map(
      (Array.isArray(arr) ? arr : []).map((it) => [String(it.id || '').replace(/^J_/, ''), it])
    );
    const num = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : null;
    };
    const items = [];
    for (const sku of skus) {
      const it = map.get(sku);
      if (it) {
        const price = num(it.p);
        if (price != null && price > 0) {
          items.push({
            sku,
            price,
            originalPrice: num(it.op) || price,
            promotion: it.cpr || ''
          });
        }
      }
    }
    return { items, error: null };
  } catch (e) {
    return { items: [], error: e.message || String(e) };
  } finally {
    clearTimeout(t);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('[fetch-jd-prices] 启动...');
  console.log('[fetch-jd-prices] 工作目录:', PROJECT_ROOT);

  // 1. 加载 SKU 映射
  let skuMap;
  try {
    skuMap = await loadSkuMap();
  } catch (e) {
    console.error('[fetch-jd-prices] 读取 SKU 映射失败：', e.message);
    process.exit(1);
  }

  let skuList;
  if (IDS_OVERRIDE) {
    skuList = IDS_OVERRIDE;
  } else {
    skuList = Object.values(skuMap).filter(Boolean);
  }
  // 去重
  skuList = [...new Set(skuList)];
  console.log(`[fetch-jd-prices] 共 ${skuList.length} 个 SKU，分 ${Math.ceil(skuList.length / CHUNK)} 批`);

  // 2. 分块抓取
  const allItems = [];
  const failedChunks = [];
  for (let i = 0; i < skuList.length; i += CHUNK) {
    const group = skuList.slice(i, i + CHUNK);
    const { items, error } = await fetchChunk(group);
    if (error) {
      failedChunks.push({ start: i, end: i + group.length, error });
      console.log(`[batch ${i / CHUNK + 1}] ✗ ${error}`);
    } else {
      console.log(`[batch ${i / CHUNK + 1}] ✓ ${items.length}/${group.length}`);
      allItems.push(...items);
    }
    // 防风控
    if (i + CHUNK < skuList.length) {
      await sleep(DELAY_MS);
    }
  }

  // 3. 合并已有缓存（保留老数据，新数据覆盖）
  const cachePath = path.join(PROJECT_ROOT, 'data/jd-prices-cache.json');
  let oldCache = {};
  if (fs.existsSync(cachePath)) {
    try {
      oldCache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    } catch {
      oldCache = {};
    }
  }
  const merged = { ...oldCache };
  const ts = Date.now();
  for (const it of allItems) {
    merged[it.sku] = { ...it, fetchedAt: ts };
  }

  // 4. 写回
  fs.writeFileSync(cachePath, JSON.stringify(merged, null, 2));
  console.log(`[fetch-jd-prices] ✓ 已写入 ${cachePath}`);
  console.log(`[fetch-jd-prices] 本次新增 ${allItems.length} 条，合计 ${Object.keys(merged).length} 条`);
  if (failedChunks.length > 0) {
    console.log(`[fetch-jd-prices] ⚠ ${failedChunks.length} 个分块失败，可重试`);
  }
  console.log('[fetch-jd-prices] 完成');
}

main().catch((e) => {
  console.error('[fetch-jd-prices] 异常：', e);
  process.exit(1);
});
