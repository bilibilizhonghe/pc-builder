/**
 * 京东 SKU 解析与存储
 *
 * 用户通过 UI 粘贴京东商品链接后：
 *   1. extractJdSku() 提取 10 位数字 SKU
 *   2. saveJdSkuBinding() 写入 localStorage（覆盖 JD_SKU_DEMO）
 *   3. resolveJdSku() 在使用处优先取 localStorage，其次 JD_SKU_DEMO
 */

import { JD_SKU_DEMO } from '../data/jdSkuMap.js';

const STORAGE_KEY = 'jd_sku_overrides_v1';

/**
 * 从任意京东链接/字符串中提取 10 位数字 SKU
 * 支持：
 *   - https://item.jd.com/100012345.html
 *   - https://item.jd.com/100012345
 *   - https://item.jd.com/product/100012345.html
 *   - 100012345
 *   - J_100012345
 *   - 移动端 m-item.jd.com/.../100012345.html
 */
export function extractJdSku(input) {
  if (!input) return null;
  const text = String(input).trim();
  // 去掉 J_ 前缀
  const cleaned = text.replace(/^J_/, '');
  // 匹配商品 ID（路径中紧跟 .html 或路径结尾的 8~12 位数字）
  const m =
    cleaned.match(/[\\/](\d{8,12})(?:\.html)?(?:\?|$|#)/) ||
    cleaned.match(/[\\/](\d{8,12})\.html/) ||
    cleaned.match(/\b(\d{8,12})\b/);
  if (!m) return null;
  const num = m[1];
  // 京东 SKU 一般为 10~12 位
  if (num.length < 8 || num.length > 13) return null;
  return num;
}

/**
 * 读取所有用户自定义覆盖
 */
export function loadJdOverrides() {
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
 * 保存单个硬件 ID → SKU 映射
 */
export function saveJdSkuBinding(hardwareId, sku) {
  if (!hardwareId || !sku) return;
  const all = loadJdOverrides();
  all[hardwareId] = String(sku);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // 忽略容量错误
  }
}

/**
 * 删除单个绑定
 */
export function removeJdSkuBinding(hardwareId) {
  const all = loadJdOverrides();
  delete all[hardwareId];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

/**
 * 解析某个硬件的最终 SKU（localStorage 优先）
 */
export function resolveJdSku(hardwareId) {
  const overrides = loadJdOverrides();
  return overrides[hardwareId] || JD_SKU_DEMO[hardwareId] || null;
}

/**
 * 解析一批硬件的 SKU
 */
export function resolveJdSkus(hardwareIds) {
  const overrides = loadJdOverrides();
  const out = {};
  hardwareIds.forEach((id) => {
    if (!id) return;
    out[id] = overrides[id] || JD_SKU_DEMO[id] || null;
  });
  return out;
}

/**
 * 判断 SKU 是否被用户覆盖过
 */
export function isOverridden(hardwareId) {
  return Object.prototype.hasOwnProperty.call(loadJdOverrides(), hardwareId);
}
