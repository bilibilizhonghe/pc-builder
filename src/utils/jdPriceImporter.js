/**
 * 京东真实价格导入器
 *
 * 数据来源：用户在自己能联网的环境通过 Postman/curl 抓取
 *   curl "https://p.3.cn/prices/mgets?skuIds=J_100012345,J_100056789012"
 *
 * 持久化：localStorage key = 'jd_real_prices_v1'
 *
 * 优先级：用户导入 > 后端 API > 演示 mock
 * 真实导入的价格会被标记为"已验证"，徽章显示「JD」而非「演示」
 */

const STORAGE_KEY = 'jd_real_prices_v1';

/**
 * 解析多种格式的京东价格 JSON
 * 支持：
 *   1) p.3.cn 原生：[{id:"J_100012345",p:"1234.00",m:"...",t:"...",op:"1399.00",cpr:"..."}, ...]
 *   2) 简化对象：{"100012345": {"price": 1234, "originalPrice": 1399, "promotion": "..."}}
 *   3) 简化数组：[{"sku":"100012345","price":1234,"originalPrice":1399,"promotion":"..."}]
 *   4) 兼容 price="1234.00" 字符串
 *
 * @returns {{ ok: boolean, items: Array<{sku, price, originalPrice, promotion}>, errors: string[] }}
 */
export function parsePriceJson(text) {
  const errors = [];
  const items = [];

  if (!text || typeof text !== 'string') {
    return { ok: false, items, errors: ['输入为空'] };
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { ok: false, items, errors: [`JSON 解析失败：${e.message}`] };
  }

  const num = (v) => {
    if (v == null) return null;
    const n = typeof v === 'number' ? v : parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };

  // 情况 1: 数组（p.3.cn 原生 或简化数组）
  if (Array.isArray(data)) {
    data.forEach((it, idx) => {
      // 提取 SKU
      let sku = (it.id || it.sku || '').toString().replace(/^J_/, '').trim();
      // 提取价格
      let price = num(it.p ?? it.price);
      const originalPrice = num(it.op ?? it.originalPrice) || price;
      const promotion = it.cpr ?? it.promotion ?? '';

      if (!sku) {
        errors.push(`第 ${idx + 1} 项缺少 SKU`);
        return;
      }
      if (price == null || price <= 0) {
        errors.push(`SKU ${sku} 价格无效（${it.p ?? it.price}）`);
        return;
      }
      items.push({ sku, price, originalPrice, promotion });
    });
  }
  // 情况 2: 对象
  else if (data && typeof data === 'object') {
    Object.entries(data).forEach(([skuRaw, v]) => {
      const sku = skuRaw.toString().replace(/^J_/, '').trim();
      if (!v || typeof v !== 'object') {
        errors.push(`SKU ${sku} 数据格式错误`);
        return;
      }
      const price = num(v.p ?? v.price);
      if (price == null || price <= 0) {
        errors.push(`SKU ${sku} 价格无效`);
        return;
      }
      const originalPrice = num(v.op ?? v.originalPrice) || price;
      const promotion = v.cpr ?? v.promotion ?? '';
      items.push({ sku, price, originalPrice, promotion });
    });
  } else {
    errors.push('JSON 根节点必须是数组或对象');
  }

  return { ok: items.length > 0, items, errors };
}

/**
 * 读取已导入的真实价格
 */
export function loadImportedPrices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

/**
 * 保存一批真实价格（合并而非覆盖：保留已有键，添加新键）
 */
export function saveImportedPrices(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const all = loadImportedPrices();
  const ts = Date.now();
  items.forEach((it) => {
    all[it.sku] = { ...it, importedAt: ts };
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
  return items.length;
}

/**
 * 删除某个 SKU 的导入价格
 */
export function removeImportedPrice(sku) {
  const all = loadImportedPrices();
  delete all[sku];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

/**
 * 清空所有导入
 */
export function clearImportedPrices() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * 生成一份用户可直接复制到 Postman/curl 的"待抓取 SKU 列表"
 */
export function buildFetchUrl(skus) {
  const skuParam = skus.filter(Boolean).map((s) => `J_${s}`).join(',');
  return `https://p.3.cn/prices/mgets?skuIds=${encodeURIComponent(skuParam)}`;
}

/**
 * 预填的 curl 命令模板（便于用户复制）
 */
export function buildCurlCommand(skus) {
  const url = buildFetchUrl(skus);
  return `curl -H "User-Agent: Mozilla/5.0" -H "Referer: https://item.jd.com/" "${url}"`;
}
