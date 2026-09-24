import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRICE_CACHE_PATH = path.resolve(__dirname, 'data/jd-prices-cache.json');

/**
 * 京东价格代理中间件
 * - 解决浏览器跨域问题
 * - 转发到 p.3.cn 价格接口
 * - 失败时降级为 mock 数据，保证 UI 在无网环境也能完整展示
 *
 * 接口：
 *   GET /api/jd/price?skuIds=J_100012345678,J_234567890123
 *   返回：{ items: [{sku, price, originalPrice, promotion}], source: 'jd' | 'mock' }
 */

const JD_PRICE_API = 'https://p.3.cn/prices/mgets';
const JD_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  Referer: 'https://item.jd.com/',
  Accept: '*/*'
};

// 内存缓存：key=skuIds 串，value={ ts, data, source }
const cache = new Map();
const CACHE_TTL = 60 * 1000;

/**
 * 读取本地价格缓存文件（由 scripts/fetch-jd-prices.mjs 生成）
 * 在 vite 启动时加载到内存，避免每次请求都读文件
 */
let localPriceCache = null;
let localPriceCacheMtime = 0;
function loadLocalCache() {
  try {
    if (!fs.existsSync(PRICE_CACHE_PATH)) return {};
    const stat = fs.statSync(PRICE_CACHE_PATH);
    if (localPriceCache && stat.mtimeMs === localPriceCacheMtime) {
      return localPriceCache;
    }
    const text = fs.readFileSync(PRICE_CACHE_PATH, 'utf-8');
    const obj = JSON.parse(text);
    // 过滤掉注释字段
    const cleaned = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('_')) continue;
      cleaned[k] = v;
    }
    localPriceCache = cleaned;
    localPriceCacheMtime = stat.mtimeMs;
    return cleaned;
  } catch {
    return {};
  }
}

// Mock 价格生成（基于 SKU 末位做"伪随机"，保证同一 SKU 价格稳定）
function mockPriceFor(sku) {
  const last = parseInt(sku.slice(-4), 10) || 0;
  const base = 500 + (last * 37) % 8000; // 500~8500
  const discountPct = 5 + (last % 15); // 5~19% 折扣
  const price = Math.round(base * (1 - discountPct / 100));
  const originalPrice = base;
  return {
    sku,
    price,
    originalPrice,
    promotion: discountPct >= 10 ? `每满1000减${Math.round(discountPct * 10)}` : ''
  };
}

function jdApiPlugin() {
  return {
    name: 'jd-api-proxy',
    configureServer(server) {
      // 京东价格批量查询
      server.middlewares.use('/api/jd/price', async (req, res) => {
        try {
          const url = new URL(req.url, 'http://localhost');
          const skuIds = (url.searchParams.get('skuIds') || '').trim();
          const forceMock = url.searchParams.get('mock') === '1';

          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'application/json; charset=utf-8');

          if (!skuIds) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'skuIds is required' }));
            return;
          }

          // 命中缓存直接返回
          const cached = cache.get(skuIds);
          if (cached && Date.now() - cached.ts < CACHE_TTL) {
            res.statusCode = 200;
            res.setHeader('X-Cache', 'HIT');
            res.setHeader('X-Source', cached.source);
            res.end(JSON.stringify({ items: cached.data, source: cached.source, cachedAt: cached.ts }));
            return;
          }

          // 拆分 SKU 列表
          const skuList = skuIds
            .split(',')
            .map((s) => s.trim().replace(/^J_/, ''))
            .filter(Boolean);

          // 1) 优先：本地缓存文件（npm run fetch-prices 生成的真实数据）
          const local = loadLocalCache();
          const fromLocal = skuList
            .filter((s) => local[s] && local[s].price > 0)
            .map((s) => ({
              sku: s,
              price: local[s].price,
              originalPrice: local[s].originalPrice || local[s].price,
              promotion: local[s].promotion || ''
            }));

          if (fromLocal.length === skuList.length) {
            // 全部命中本地缓存 → 直接返回（最高优先级）
            cache.set(skuIds, { ts: Date.now(), data: fromLocal, source: 'cache' });
            res.statusCode = 200;
            res.setHeader('X-Source', 'cache');
            res.end(
              JSON.stringify({
                items: fromLocal,
                source: 'cache',
                cachedAt: Date.now()
              })
            );
            return;
          }

          // 2) 本地缓存 + 缺失的 SKU 需要走 API
          const missingForApi = skuList.filter((s) => !fromLocal.find((x) => x.sku === s));

          // 强制 mock 模式
          if (forceMock) {
            const items = [...fromLocal, ...missingForApi.map(mockPriceFor)];
            cache.set(skuIds, { ts: Date.now(), data: items, source: fromLocal.length ? 'cache-partial-mock' : 'mock' });
            res.statusCode = 200;
            res.setHeader('X-Source', fromLocal.length ? 'cache-partial-mock' : 'mock');
            res.end(
              JSON.stringify({ items, source: fromLocal.length ? 'cache-partial-mock' : 'mock', cachedAt: Date.now() })
            );
            return;
          }

          // 3) 真实接口尝试（仅请求缺失的 SKU）
          const targetUrl = `${JD_PRICE_API}?skuIds=${encodeURIComponent(missingForApi.map((s) => `J_${s}`).join(','))}`;
          let r;
          try {
            r = await fetch(targetUrl, { headers: JD_HEADERS, signal: AbortSignal.timeout(5000) });
          } catch (e) {
            // 网络失败 → fallback mock
            const items = [...fromLocal, ...missingForApi.map(mockPriceFor)];
            const source = fromLocal.length ? 'cache-partial-mock' : 'mock-fallback';
            cache.set(skuIds, { ts: Date.now(), data: items, source });
            res.statusCode = 200;
            res.setHeader('X-Source', source);
            res.end(
              JSON.stringify({
                items,
                source,
                notice: `JD unreachable (${e?.cause?.code || e?.message || 'unknown'}), using ${fromLocal.length ? 'cache + demo' : 'demo data'}`,
                cachedAt: Date.now()
              })
            );
            return;
          }

          if (!r.ok) {
            const items = [...fromLocal, ...missingForApi.map(mockPriceFor)];
            const source = fromLocal.length ? 'cache-partial-mock' : 'mock-fallback';
            cache.set(skuIds, { ts: Date.now(), data: items, source });
            res.statusCode = 200;
            res.setHeader('X-Source', source);
            res.end(
              JSON.stringify({
                items,
                source,
                notice: `JD upstream ${r.status}, using ${fromLocal.length ? 'cache + demo' : 'demo data'}`,
                cachedAt: Date.now()
              })
            );
            return;
          }

          // 解析京东返回
          const text = await r.text();
          let raw = [];
          try {
            raw = JSON.parse(text);
          } catch {
            raw = [];
          }

          const jdMap = new Map(
            (Array.isArray(raw) ? raw : []).map((it) => [String(it.id || '').replace(/^J_/, ''), it])
          );

          const num = (v) => {
            const n = parseFloat(v);
            return Number.isFinite(n) ? n : null;
          };

          const fromApi = missingForApi
            .map((sku) => {
              const it = jdMap.get(sku);
              if (it) {
                const price = num(it.p);
                if (price != null && price > 0) {
                  return {
                    sku,
                    price,
                    originalPrice: num(it.op) || price,
                    promotion: it.cpr || ''
                  };
                }
              }
              return null;
            })
            .filter(Boolean);

          // 缺失部分 API 也没有 → mock
          const stillMissing = missingForApi.filter((s) => !fromApi.find((x) => x.sku === s));
          const items = [...fromLocal, ...fromApi, ...stillMissing.map(mockPriceFor)];

          // 决定 source
          let source;
          if (fromLocal.length === skuList.length) source = 'cache';
          else if (stillMissing.length > 0) source = fromLocal.length ? 'cache-partial-mock' : 'mock-fallback';
          else if (fromApi.length === missingForApi.length) source = fromLocal.length ? 'cache+j' : 'jd';
          else source = fromLocal.length ? 'cache+j-partial' : 'jd-partial';

          cache.set(skuIds, { ts: Date.now(), data: items, source });
          res.statusCode = 200;
          res.setHeader('X-Source', source);
          res.end(JSON.stringify({ items, source, cachedAt: Date.now() }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: e?.message || 'proxy error' }));
        }
      });

      // 健康检查
      server.middlewares.use('/api/jd/health', (_req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true, cacheSize: cache.size, ttlMs: CACHE_TTL }));
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), jdApiPlugin()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    open: true
  }
});
