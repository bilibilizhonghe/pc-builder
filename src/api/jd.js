/**
 * 京东价格客户端
 * - 通过 Vite 中间件代理（同源）调用京东 p.3.cn
 * - 支持批量 SKU 查询，自动去重
 * - 客户端二次缓存（5 分钟 TTL）
 * - 失败 / 无效 SKU 时返回 null，前端按本地价兜底
 * - 当接口标记 source=mock-* 时，前端 UI 会显示"演示"标识
 */

const ENDPOINT = '/api/jd/price';
const CLIENT_TTL = 5 * 60 * 1000; // 5 分钟
const clientCache = new Map();

/**
 * 批量拉取京东价
 * @param {string[]} skuList
 * @returns {Promise<{ priceMap: Record<string, {price, originalPrice, promotion} | null>, source: string }>}
 */
export async function fetchJdPrices(skuList) {
  const skus = [...new Set(skuList.filter(Boolean))];
  const result = { priceMap: {}, source: 'jd' };

  if (skus.length === 0) return result;

  const now = Date.now();
  const needFetch = [];
  for (const sku of skus) {
    const hit = clientCache.get(sku);
    if (hit && now - hit.ts < CLIENT_TTL) {
      result.priceMap[sku] = hit.data;
    } else {
      needFetch.push(sku);
    }
  }

  if (needFetch.length === 0) return result;

  const chunks = chunk(needFetch, 30);
  for (const group of chunks) {
    const skuIds = group.map((s) => `J_${s}`).join(',');
    try {
      const r = await fetch(`${ENDPOINT}?skuIds=${encodeURIComponent(skuIds)}`);
      if (!r.ok) {
        group.forEach((s) => (result.priceMap[s] = null));
        continue;
      }
      const json = await r.json();
      // 合并 source（任一接口为 mock，整体降级）
      if (json.source && json.source.startsWith('mock')) {
        result.source = json.source;
      }
      const items = json.items || [];
      const map = new Map(items.map((it) => [it.sku, it]));
      group.forEach((s) => {
        const it = map.get(s);
        if (it && it.price != null && it.price > 0) {
          const data = {
            price: it.price,
            originalPrice: it.originalPrice,
            promotion: it.promotion
          };
          clientCache.set(s, { ts: now, data });
          result.priceMap[s] = data;
        } else {
          clientCache.set(s, { ts: now, data: null });
          result.priceMap[s] = null;
        }
      });
    } catch {
      group.forEach((s) => (result.priceMap[s] = null));
    }
  }

  return result;
}

export async function refreshJdPrices(skuList) {
  skuList.forEach((s) => clientCache.delete(s));
  return fetchJdPrices(skuList);
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function formatPrice(n) {
  if (n == null) return '-';
  return '¥' + Number(n).toLocaleString('zh-CN');
}
