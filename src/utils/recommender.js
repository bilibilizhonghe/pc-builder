/**
 * 智能推荐算法
 * 根据用户输入的预算、用途、品牌偏好，生成一套配置。
 * 规则说明：
 *  1. 按"用途"调整预算分配权重：
 *     - 3A 游戏：显卡权重最大 (40%)
 *     - 视频剪辑：CPU + 内存权重提升
 *     - AI 绘图：显卡 + 大内存权重提升
 *     - 办公影音：均衡，电源/主板可以省
 *     - 无偏好：使用 DEFAULT_BUDGET_RATIO
 *  2. 品牌偏好：CPU/主板/GPU 优先筛选对应品牌；无偏好则按价格/性能综合选
 *  3. 在每个分类的预算范围内，挑"价格 ≤ 该分类预算"中最贵的那件（性价比思路）
 *  4. 若某分类无符合预算的件，则退而求其次选最便宜的
 *  5. 整套配置完成后做一次兼容性检测，必要时降级替换
 */

import { HARDWARE_DB, CATEGORIES, DEFAULT_BUDGET_RATIO } from '../data/hardware.js';
import { checkCompatibility } from './compatibility.js';

// 不同用途下的预算分配权重
const RATIO_PRESETS = {
  gaming: { cpu: 0.2, motherboard: 0.08, gpu: 0.4, ram: 0.08, storage: 0.06, psu: 0.08, case: 0.05, cooler: 0.05 },
  office: { cpu: 0.18, motherboard: 0.1, gpu: 0.1, ram: 0.12, storage: 0.15, psu: 0.1, case: 0.15, cooler: 0.1 },
  editing: { cpu: 0.28, motherboard: 0.1, gpu: 0.2, ram: 0.18, storage: 0.1, psu: 0.06, case: 0.04, cooler: 0.04 },
  aiart: { cpu: 0.16, motherboard: 0.08, gpu: 0.4, ram: 0.18, storage: 0.08, psu: 0.06, case: 0.02, cooler: 0.02 },
  none: DEFAULT_BUDGET_RATIO
};

const PURPOSE_LABEL = {
  gaming: '3A 游戏',
  office: '办公影音',
  editing: '视频剪辑',
  aiart: 'AI 绘图',
  none: '无偏好'
};

export const USAGE_OPTIONS = [
  { value: 'gaming', label: PURPOSE_LABEL.gaming },
  { value: 'office', label: PURPOSE_LABEL.office },
  { value: 'editing', label: PURPOSE_LABEL.editing },
  { value: 'aiart', label: PURPOSE_LABEL.aiart },
  { value: 'none', label: PURPOSE_LABEL.none }
];

export const BRAND_OPTIONS = [
  { value: 'any', label: '无偏好' },
  { value: 'Intel', label: 'Intel' },
  { value: 'AMD', label: 'AMD' }
];

/**
 * 给定一个分类和预算上限，挑出最合适的一件。
 * 策略：不超过预算时挑最贵的；否则挑最便宜的兜底。
 */
function pickForCategory(category, budget, brandFilter) {
  let pool = HARDWARE_DB.filter((h) => h.category === category);

  // 品牌筛选：仅作用于 CPU / 主板 / GPU
  if (brandFilter && brandFilter !== 'any' && ['cpu', 'motherboard', 'gpu'].includes(category)) {
    const filtered = pool.filter((h) => h.brand === brandFilter);
    // 若筛选后无结果，回退到全部
    if (filtered.length > 0) pool = filtered;
  }

  if (pool.length === 0) return null;

  // 不超预算的最贵
  const affordable = pool.filter((h) => h.price <= budget);
  if (affordable.length > 0) {
    return affordable.reduce((a, b) => (a.price >= b.price ? a : b));
  }
  // 否则挑最便宜的
  return pool.reduce((a, b) => (a.price <= b.price ? a : b));
}

/**
 * 智能推荐主函数
 * @param {object} params
 * @param {number} params.budget   预算（元）
 * @param {string} params.usage    用途
 * @param {string} params.brand    品牌偏好
 * @returns {{ build: object, total: number, report: object }}
 */
export function recommend({ budget, usage, brand }) {
  const ratio = RATIO_PRESETS[usage] || DEFAULT_BUDGET_RATIO;
  const build = {};
  const details = {};

  for (const cat of CATEGORIES) {
    const catBudget = Math.round(budget * ratio[cat]);
    const picked = pickForCategory(cat, catBudget, brand);
    if (picked) {
      build[cat] = picked;
      details[cat] = {
        budget: catBudget,
        price: picked.price,
        used: picked.price <= catBudget
      };
    }
  }

  // 兼容性自检：若失败尝试降级（优先替换电源 → 主板 → 散热器）
  let compat = checkCompatibility(build);
  if (!compat.ok) {
    // 简单降级策略：电源不够时升级电源
    if (build.psu) {
      const cpuTdp = build.cpu?.specs?.tdp ?? 0;
      const gpuTdp = build.gpu?.specs?.tdp ?? 0;
      const required = cpuTdp + gpuTdp + 80 + 150;
      const upgradedPsu = HARDWARE_DB
        .filter((h) => h.category === 'psu' && h.specs.wattage >= required)
        .sort((a, b) => a.price - b.price)[0];
      if (upgradedPsu) {
        build.psu = upgradedPsu;
        details.psu = { budget: details.psu.budget, price: upgradedPsu.price, used: false, upgraded: true };
      }
    }
    compat = checkCompatibility(build);
  }

  const total = Object.values(build).reduce((sum, item) => sum + (item?.price ?? 0), 0);

  return {
    build,
    total,
    report: {
      purpose: PURPOSE_LABEL[usage] || '无偏好',
      brand,
      ratio,
      details,
      compatibility: compat
    }
  };
}

/**
 * 价格格式化
 */
export function formatPrice(n) {
  if (n == null) return '-';
  return '¥' + n.toLocaleString('zh-CN');
}
