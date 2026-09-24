/**
 * 模拟硬件数据库（100+ 件，覆盖主流品牌/价位/场景）
 * 字段说明：
 *  - id: 唯一标识
 *  - category: 分类
 *  - name: 完整名称
 *  - brand: 品牌阵营（用于推荐筛选：Intel / AMD / NVIDIA / 通用）
 *  - price: 本地参考价（元）
 *  - specs: 关键参数对象，用于兼容性判断
 *  - tags: 标签（用于 UI 搜索/筛选）
 */

// 分类中英文映射（9 大类，含新增的"风扇"）
export const CATEGORY_LABELS = {
  cpu: '处理器 CPU',
  motherboard: '主板',
  gpu: '显卡',
  ram: '内存',
  storage: '硬盘',
  psu: '电源',
  case: '机箱',
  cooler: '散热器',
  fan: '机箱风扇'
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS);

export const DEFAULT_BUDGET_RATIO = {
  cpu: 0.2,
  motherboard: 0.1,
  gpu: 0.26,
  ram: 0.08,
  storage: 0.08,
  psu: 0.08,
  case: 0.08,
  cooler: 0.07,
  fan: 0.05
};

export const HARDWARE_DB = [
  // ===================== CPU (16 件) =====================
  // Intel
  { id: 'cpu-i3-12100f', category: 'cpu', name: 'Intel i3-12100F', brand: 'Intel', price: 599, tags: ['入门', '办公'], specs: { socket: 'LGA1700', tdp: 58, cores: 4, threads: 8 } },
  { id: 'cpu-i5-12400f', category: 'cpu', name: 'Intel i5-12400F', brand: 'Intel', price: 849, tags: ['入门', '性价比'], specs: { socket: 'LGA1700', tdp: 65, cores: 6, threads: 12 } },
  { id: 'cpu-i5-13400f', category: 'cpu', name: 'Intel i5-13400F', brand: 'Intel', price: 1099, tags: ['主流', '性价比'], specs: { socket: 'LGA1700', tdp: 65, cores: 10, threads: 16 } },
  { id: 'cpu-i5-14400f', category: 'cpu', name: 'Intel i5-14400F', brand: 'Intel', price: 1199, tags: ['主流'], specs: { socket: 'LGA1700', tdp: 65, cores: 10, threads: 16 } },
  { id: 'cpu-i5-14600k', category: 'cpu', name: 'Intel i5-14600K', brand: 'Intel', price: 1999, tags: ['主流', '游戏', '超频'], specs: { socket: 'LGA1700', tdp: 125, cores: 14, threads: 20 } },
  { id: 'cpu-i7-13700k', category: 'cpu', name: 'Intel i7-13700K', brand: 'Intel', price: 2899, tags: ['高端', '游戏', '剪辑'], specs: { socket: 'LGA1700', tdp: 125, cores: 16, threads: 24 } },
  { id: 'cpu-i7-14700k', category: 'cpu', name: 'Intel i7-14700K', brand: 'Intel', price: 3199, tags: ['高端', '游戏', '剪辑', 'AI'], specs: { socket: 'LGA1700', tdp: 125, cores: 20, threads: 28 } },
  { id: 'cpu-i7-14700kf', category: 'cpu', name: 'Intel i7-14700KF', brand: 'Intel', price: 3099, tags: ['高端', '超频', '无核显'], specs: { socket: 'LGA1700', tdp: 125, cores: 20, threads: 28 } },
  { id: 'cpu-i9-14900k', category: 'cpu', name: 'Intel i9-14900K', brand: 'Intel', price: 4599, tags: ['旗舰', 'AI', '剪辑', '超频'], specs: { socket: 'LGA1700', tdp: 125, cores: 24, threads: 32 } },
  { id: 'cpu-i9-14900ks', category: 'cpu', name: 'Intel i9-14900KS', brand: 'Intel', price: 5999, tags: ['旗舰', '极致'], specs: { socket: 'LGA1700', tdp: 150, cores: 24, threads: 32 } },
  // AMD
  { id: 'cpu-r5-5500', category: 'cpu', name: 'AMD R5 5500', brand: 'AMD', price: 549, tags: ['入门', '办公'], specs: { socket: 'AM4', tdp: 65, cores: 6, threads: 12 } },
  { id: 'cpu-r5-5600', category: 'cpu', name: 'AMD R5 5600', brand: 'AMD', price: 749, tags: ['入门', '性价比'], specs: { socket: 'AM4', tdp: 65, cores: 6, threads: 12 } },
  { id: 'cpu-r5-7500f', category: 'cpu', name: 'AMD R5 7500F', brand: 'AMD', price: 999, tags: ['主流', '游戏'], specs: { socket: 'AM5', tdp: 65, cores: 6, threads: 12 } },
  { id: 'cpu-r7-7700x', category: 'cpu', name: 'AMD R7 7700X', brand: 'AMD', price: 1899, tags: ['主流', '游戏'], specs: { socket: 'AM5', tdp: 105, cores: 8, threads: 16 } },
  { id: 'cpu-r7-7800x3d', category: 'cpu', name: 'AMD R7 7800X3D', brand: 'AMD', price: 2699, tags: ['高端', '游戏', '3D缓存'], specs: { socket: 'AM5', tdp: 120, cores: 8, threads: 16 } },
  { id: 'cpu-r9-7900x', category: 'cpu', name: 'AMD R9 7900X', brand: 'AMD', price: 2999, tags: ['高端', '剪辑'], specs: { socket: 'AM5', tdp: 170, cores: 12, threads: 24 } },
  { id: 'cpu-r9-7950x', category: 'cpu', name: 'AMD R9 7950X', brand: 'AMD', price: 3999, tags: ['旗舰', 'AI', '剪辑'], specs: { socket: 'AM5', tdp: 170, cores: 16, threads: 32 } },
  { id: 'cpu-r9-7950x3d', category: 'cpu', name: 'AMD R9 7950X3D', brand: 'AMD', price: 4799, tags: ['旗舰', '游戏', 'AI', '3D缓存'], specs: { socket: 'AM5', tdp: 170, cores: 16, threads: 32 } },

  // ===== 2024 新平台：Intel Core Ultra 200S (Arrow Lake, LGA1851) =====
  { id: 'cpu-u9-285k', category: 'cpu', name: 'Intel Core Ultra 9 285K', brand: 'Intel', price: 4799, tags: ['旗舰', 'AI', '剪辑', '2024'], specs: { socket: 'LGA1851', tdp: 125, cores: 24, threads: 24 } },
  { id: 'cpu-u7-265k', category: 'cpu', name: 'Intel Core Ultra 7 265K', brand: 'Intel', price: 3299, tags: ['高端', '游戏', '剪辑', '2024'], specs: { socket: 'LGA1851', tdp: 125, cores: 20, threads: 20 } },
  { id: 'cpu-u7-265kf', category: 'cpu', name: 'Intel Core Ultra 7 265KF', brand: 'Intel', price: 3099, tags: ['高端', '超频', '无核显', '2024'], specs: { socket: 'LGA1851', tdp: 125, cores: 20, threads: 20 } },
  { id: 'cpu-u5-245k', category: 'cpu', name: 'Intel Core Ultra 5 245K', brand: 'Intel', price: 2199, tags: ['主流', '游戏', '2024'], specs: { socket: 'LGA1851', tdp: 125, cores: 14, threads: 14 } },
  { id: 'cpu-u5-245kf', category: 'cpu', name: 'Intel Core Ultra 5 245KF', brand: 'Intel', price: 1999, tags: ['主流', '无核显', '2024'], specs: { socket: 'LGA1851', tdp: 125, cores: 14, threads: 14 } },

  // ===== 2024 新平台：AMD Ryzen 9000 (Zen 5, AM5) =====
  { id: 'cpu-r9-9950x', category: 'cpu', name: 'AMD R9 9950X', brand: 'AMD', price: 4799, tags: ['旗舰', 'AI', '剪辑', 'Zen5', '2024'], specs: { socket: 'AM5', tdp: 170, cores: 16, threads: 32 } },
  { id: 'cpu-r9-9900x', category: 'cpu', name: 'AMD R9 9900X', brand: 'AMD', price: 3499, tags: ['高端', '剪辑', 'Zen5', '2024'], specs: { socket: 'AM5', tdp: 120, cores: 12, threads: 24 } },
  { id: 'cpu-r7-9800x3d', category: 'cpu', name: 'AMD R7 9800X3D', brand: 'AMD', price: 3299, tags: ['旗舰', '游戏', 'Zen5', '3D缓存', '2024'], specs: { socket: 'AM5', tdp: 120, cores: 8, threads: 16 } },
  { id: 'cpu-r7-9700x', category: 'cpu', name: 'AMD R7 9700X', brand: 'AMD', price: 2299, tags: ['主流', '游戏', 'Zen5', '2024'], specs: { socket: 'AM5', tdp: 65, cores: 8, threads: 16 } },
  { id: 'cpu-r5-9600x', category: 'cpu', name: 'AMD R5 9600X', brand: 'AMD', price: 1399, tags: ['主流', '性价比', 'Zen5', '2024'], specs: { socket: 'AM5', tdp: 65, cores: 6, threads: 12 } },

  // ===================== 主板 (12 件) =====================
  // Intel LGA1700
  { id: 'mb-h610m', category: 'motherboard', name: '华硕 PRIME H610M-K', brand: 'Intel', price: 549, tags: ['入门'], specs: { socket: 'LGA1700', chipset: 'H610', formFactor: 'mATX', ramType: 'DDR4', ramSlots: 2, maxRam: 64 } },
  { id: 'mb-b660m', category: 'motherboard', name: '微星 PRO B660M-A', brand: 'Intel', price: 749, tags: ['入门'], specs: { socket: 'LGA1700', chipset: 'B660', formFactor: 'mATX', ramType: 'DDR4', ramSlots: 4, maxRam: 128 } },
  { id: 'mb-b760m', category: 'motherboard', name: '华硕 PRIME B760M-K', brand: 'Intel', price: 899, tags: ['主流'], specs: { socket: 'LGA1700', chipset: 'B760', formFactor: 'mATX', ramType: 'DDR5', ramSlots: 2, maxRam: 64 } },
  { id: 'mb-b760-ddr4', category: 'motherboard', name: '微星 MAG B760M MORTAR DDR4', brand: 'Intel', price: 999, tags: ['主流', '性价比'], specs: { socket: 'LGA1700', chipset: 'B760', formFactor: 'mATX', ramType: 'DDR4', ramSlots: 4, maxRam: 128 } },
  { id: 'mb-b760-itx', category: 'motherboard', name: '华擎 B760M-ITX/D4 WiFi', brand: 'Intel', price: 1099, tags: ['ITX', '小机箱'], specs: { socket: 'LGA1700', chipset: 'B760', formFactor: 'ITX', ramType: 'DDR4', ramSlots: 2, maxRam: 64 } },
  { id: 'mb-z790-ddr4', category: 'motherboard', name: '华硕 PRIME Z790-P DDR4', brand: 'Intel', price: 1699, tags: ['高端'], specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', ramType: 'DDR4', ramSlots: 4, maxRam: 128 } },
  { id: 'mb-z790', category: 'motherboard', name: '微星 MAG Z790 TOMAHAWK', brand: 'Intel', price: 2299, tags: ['高端'], specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 128 } },
  { id: 'mb-z790-hero', category: 'motherboard', name: '华硕 ROG MAXIMUS Z790 HERO', brand: 'Intel', price: 4799, tags: ['旗舰', '超频'], specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 192 } },
  // AMD AM5
  { id: 'mb-a620m', category: 'motherboard', name: '华硕 PRIME A620M-K', brand: 'AMD', price: 649, tags: ['入门'], specs: { socket: 'AM5', chipset: 'A620', formFactor: 'mATX', ramType: 'DDR5', ramSlots: 2, maxRam: 96 } },
  { id: 'mb-b650m', category: 'motherboard', name: '微星 MAG B650M MORTAR', brand: 'AMD', price: 1199, tags: ['主流'], specs: { socket: 'AM5', chipset: 'B650', formFactor: 'mATX', ramType: 'DDR5', ramSlots: 4, maxRam: 128 } },
  { id: 'mb-b650', category: 'motherboard', name: '华硕 TUF B650-PLUS', brand: 'AMD', price: 1499, tags: ['主流', '性价比'], specs: { socket: 'AM5', chipset: 'B650', formFactor: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 128 } },
  { id: 'mb-x670e', category: 'motherboard', name: '华硕 ROG STRIX X670E-E', brand: 'AMD', price: 2899, tags: ['高端', '超频'], specs: { socket: 'AM5', chipset: 'X670E', formFactor: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 192 } },
  // AMD AM4（保留兼容旧平台）
  { id: 'mb-b550m', category: 'motherboard', name: '微星 B550M PRO-VDH', brand: 'AMD', price: 599, tags: ['入门'], specs: { socket: 'AM4', chipset: 'B550', formFactor: 'mATX', ramType: 'DDR4', ramSlots: 4, maxRam: 128 } },

  // ===== Intel LGA1851 800 系 (Core Ultra 200S 配套) =====
  { id: 'mb-z890-e', category: 'motherboard', name: '华硕 ROG STRIX Z890-E GAMING WIFI', brand: 'Intel', price: 3999, tags: ['高端', '超频', 'WiFi7', '2024'], specs: { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 256 } },
  { id: 'mb-z890-prime', category: 'motherboard', name: '华硕 PRIME Z890-P WIFI', brand: 'Intel', price: 2399, tags: ['高端', '主流', 'WiFi7', '2024'], specs: { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 192 } },
  { id: 'mb-z890-tomahawk', category: 'motherboard', name: '微星 MAG Z890 TOMAHAWK WIFI', brand: 'Intel', price: 2899, tags: ['高端', 'WiFi7', '2024'], specs: { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 256 } },
  { id: 'mb-z890-pro', category: 'motherboard', name: '微星 PRO Z890-A WIFI', brand: 'Intel', price: 2099, tags: ['主流', 'WiFi7', '2024'], specs: { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 192 } },
  { id: 'mb-b860m', category: 'motherboard', name: '微星 PRO B860M-A WIFI', brand: 'Intel', price: 1299, tags: ['主流', 'mATX', 'WiFi7', '2024'], specs: { socket: 'LGA1851', chipset: 'B860', formFactor: 'mATX', ramType: 'DDR5', ramSlots: 4, maxRam: 192 } },
  { id: 'mb-b860-itx', category: 'motherboard', name: '华擎 B860I WIFI', brand: 'Intel', price: 1499, tags: ['ITX', '小机箱', '2024'], specs: { socket: 'LGA1851', chipset: 'B860', formFactor: 'ITX', ramType: 'DDR5', ramSlots: 2, maxRam: 96 } },

  // ===== AMD 800 系 (B850 / X870 / X870E) =====
  // 华硕 B850 小吹雪：用户特别要求
  { id: 'mb-b850a-rog', category: 'motherboard', name: '华硕 ROG STRIX B850-A GAMING WIFI 吹雪', brand: 'AMD', price: 1899, tags: ['主流', '小吹雪', '白色', 'WiFi7', '2024'], specs: { socket: 'AM5', chipset: 'B850', formFactor: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 192 } },
  { id: 'mb-b850-tomahawk', category: 'motherboard', name: '微星 MAG B850 TOMAHAWK MAX WIFI', brand: 'AMD', price: 1699, tags: ['主流', 'WiFi7', '2024'], specs: { socket: 'AM5', chipset: 'B850', formFactor: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 256 } },
  { id: 'mb-b850-aorus', category: 'motherboard', name: '技嘉 B850 AORUS ELITE WIFI7', brand: 'AMD', price: 1599, tags: ['主流', 'WiFi7', '2024'], specs: { socket: 'AM5', chipset: 'B850', formFactor: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 192 } },
  { id: 'mb-b650a-rog', category: 'motherboard', name: '华硕 ROG STRIX B650-A GAMING WIFI 吹雪', brand: 'AMD', price: 1599, tags: ['主流', '小吹雪', '白色', '2023'], specs: { socket: 'AM5', chipset: 'B650', formFactor: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 192 } },
  { id: 'mb-x870-rog', category: 'motherboard', name: '华硕 ROG STRIX X870E-E GAMING WIFI', brand: 'AMD', price: 3499, tags: ['高端', '超频', 'WiFi7', '2024'], specs: { socket: 'AM5', chipset: 'X870E', formFactor: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 256 } },
  { id: 'mb-x870-carbon', category: 'motherboard', name: '微星 MAG X870E CARBON WIFI', brand: 'AMD', price: 2999, tags: ['高端', 'WiFi7', '2024'], specs: { socket: 'AM5', chipset: 'X870E', formFactor: 'ATX', ramType: 'DDR5', ramSlots: 4, maxRam: 256 } },

  // ===================== 显卡 (15 件) =====================
  // NVIDIA RTX 40 系列
  { id: 'gpu-rtx3050', category: 'gpu', name: 'NVIDIA RTX 3050 8G', brand: 'NVIDIA', price: 1399, tags: ['入门', '1080P'], specs: { tdp: 130, length: 240, powerConnector: '8pin' } },
  { id: 'gpu-rtx4060', category: 'gpu', name: 'NVIDIA RTX 4060 8G', brand: 'NVIDIA', price: 2399, tags: ['主流', '1080P', 'DLSS3'], specs: { tdp: 115, length: 240, powerConnector: '8pin' } },
  { id: 'gpu-rtx4060ti', category: 'gpu', name: 'NVIDIA RTX 4060 Ti 8G', brand: 'NVIDIA', price: 3199, tags: ['主流', '1080P', 'DLSS3'], specs: { tdp: 160, length: 280, powerConnector: '8pin' } },
  { id: 'gpu-rtx4070', category: 'gpu', name: 'NVIDIA RTX 4070 SUPER 12G', brand: 'NVIDIA', price: 4599, tags: ['高端', '2K', 'DLSS3'], specs: { tdp: 220, length: 285, powerConnector: '16pin' } },
  { id: 'gpu-rtx4070ti', category: 'gpu', name: 'NVIDIA RTX 4070 Ti SUPER 16G', brand: 'NVIDIA', price: 6299, tags: ['高端', '2K'], specs: { tdp: 285, length: 285, powerConnector: '16pin' } },
  { id: 'gpu-rtx4080s', category: 'gpu', name: 'NVIDIA RTX 4080 SUPER 16G', brand: 'NVIDIA', price: 7999, tags: ['旗舰', '4K'], specs: { tdp: 320, length: 310, powerConnector: '16pin' } },
  { id: 'gpu-rtx4090', category: 'gpu', name: 'NVIDIA RTX 4090 24G', brand: 'NVIDIA', price: 14999, tags: ['旗舰', '4K', 'AI'], specs: { tdp: 450, length: 336, powerConnector: '16pin' } },
  { id: 'gpu-rtx4090d', category: 'gpu', name: 'NVIDIA RTX 4090D 24G', brand: 'NVIDIA', price: 13999, tags: ['旗舰', '特供版'], specs: { tdp: 425, length: 336, powerConnector: '16pin' } },
  // AMD RX 7000 系列
  { id: 'gpu-rx7600', category: 'gpu', name: 'AMD RX 7600 8G', brand: 'AMD', price: 2099, tags: ['主流', '1080P'], specs: { tdp: 165, length: 276, powerConnector: '8pin' } },
  { id: 'gpu-rx7700xt', category: 'gpu', name: 'AMD RX 7700 XT 12G', brand: 'AMD', price: 3199, tags: ['主流', '2K'], specs: { tdp: 245, length: 276, powerConnector: '8pin+8pin' } },
  { id: 'gpu-rx7800xt', category: 'gpu', name: 'AMD RX 7800 XT 16G', brand: 'AMD', price: 4199, tags: ['高端', '2K'], specs: { tdp: 263, length: 287, powerConnector: '8pin+8pin' } },
  { id: 'gpu-rx7900xt', category: 'gpu', name: 'AMD RX 7900 XT 20G', brand: 'AMD', price: 5799, tags: ['高端', '4K'], specs: { tdp: 315, length: 287, powerConnector: '8pin+8pin' } },
  { id: 'gpu-rx7900xtx', category: 'gpu', name: 'AMD RX 7900 XTX 24G', brand: 'AMD', price: 6999, tags: ['旗舰', '4K', 'AI'], specs: { tdp: 355, length: 287, powerConnector: '8pin+8pin' } },
  // 入门 / 老款
  { id: 'gpu-gtx1660s', category: 'gpu', name: 'NVIDIA GTX 1660 SUPER 6G', brand: 'NVIDIA', price: 1199, tags: ['入门', '老款'], specs: { tdp: 125, length: 230, powerConnector: '8pin' } },
  { id: 'gpu-rx6600', category: 'gpu', name: 'AMD RX 6600 8G', brand: 'AMD', price: 1499, tags: ['入门', '1080P'], specs: { tdp: 132, length: 240, powerConnector: '8pin' } },

  // ===== NVIDIA RTX 50 系列 (Blackwell, 2025) =====
  { id: 'gpu-rtx5090', category: 'gpu', name: 'NVIDIA RTX 5090 32G', brand: 'NVIDIA', price: 16499, tags: ['旗舰', '4K', 'AI', 'DLSS4', '2025'], specs: { tdp: 575, length: 358, powerConnector: '16pin' } },
  { id: 'gpu-rtx5080', category: 'gpu', name: 'NVIDIA RTX 5080 16G', brand: 'NVIDIA', price: 8999, tags: ['旗舰', '4K', 'DLSS4', '2025'], specs: { tdp: 360, length: 304, powerConnector: '16pin' } },
  { id: 'gpu-rtx5070ti', category: 'gpu', name: 'NVIDIA RTX 5070 Ti 16G', brand: 'NVIDIA', price: 6299, tags: ['高端', '2K', 'DLSS4', '2025'], specs: { tdp: 300, length: 285, powerConnector: '16pin' } },
  { id: 'gpu-rtx5070', category: 'gpu', name: 'NVIDIA RTX 5070 12G', brand: 'NVIDIA', price: 4599, tags: ['高端', '2K', 'DLSS4', '2025'], specs: { tdp: 250, length: 242, powerConnector: '16pin' } },
  { id: 'gpu-rtx5060ti', category: 'gpu', name: 'NVIDIA RTX 5060 Ti 16G', brand: 'NVIDIA', price: 3199, tags: ['主流', '1080P', 'DLSS4', '2025'], specs: { tdp: 180, length: 267, powerConnector: '8pin' } },
  { id: 'gpu-rtx5060', category: 'gpu', name: 'NVIDIA RTX 5060 8G', brand: 'NVIDIA', price: 2299, tags: ['主流', '1080P', '2025'], specs: { tdp: 145, length: 202, powerConnector: '8pin' } },

  // ===== AMD RX 9000 系列 (RDNA 4, 2025) =====
  { id: 'gpu-rx9070xt', category: 'gpu', name: 'AMD RX 9070 XT 16G', brand: 'AMD', price: 4999, tags: ['高端', '2K', 'FSR4', 'RDNA4', '2025'], specs: { tdp: 304, length: 287, powerConnector: '16pin' } },
  { id: 'gpu-rx9070', category: 'gpu', name: 'AMD RX 9070 16G', brand: 'AMD', price: 3799, tags: ['高端', '2K', 'FSR4', 'RDNA4', '2025'], specs: { tdp: 220, length: 267, powerConnector: '16pin' } },
  { id: 'gpu-rx9060xt', category: 'gpu', name: 'AMD RX 9060 XT 16G', brand: 'AMD', price: 2599, tags: ['主流', '1080P', 'RDNA4', '2025'], specs: { tdp: 180, length: 240, powerConnector: '8pin' } },

  // ===== Intel Arc Battlemage (2024) =====
  { id: 'gpu-arc-b580', category: 'gpu', name: 'Intel Arc B580 12G', brand: 'Intel', price: 1799, tags: ['主流', '1080P', '新架构', '2024'], specs: { tdp: 190, length: 272, powerConnector: '8pin' } },
  { id: 'gpu-arc-b570', category: 'gpu', name: 'Intel Arc B570 10G', brand: 'Intel', price: 1499, tags: ['入门', '1080P', '2024'], specs: { tdp: 150, length: 242, powerConnector: '8pin' } },

  // ===================== 内存 (10 件) =====================
  { id: 'ram-ddr4-8', category: 'ram', name: '金士顿 8GB DDR4 3200', brand: '通用', price: 169, tags: ['入门'], specs: { type: 'DDR4', size: 8, sticks: 1, speed: 3200 } },
  { id: 'ram-ddr4-16', category: 'ram', name: '金士顿 16GB(2x8) DDR4 3200', brand: '通用', price: 299, tags: ['主流', '性价比'], specs: { type: 'DDR4', size: 16, sticks: 2, speed: 3200 } },
  { id: 'ram-ddr4-16-single', category: 'ram', name: '威刚 16GB DDR4 3200 单条', brand: '通用', price: 269, tags: ['性价比', '单条'], specs: { type: 'DDR4', size: 16, sticks: 1, speed: 3200 } },
  { id: 'ram-ddr4-32', category: 'ram', name: '金士顿 32GB(2x16) DDR4 3600', brand: '通用', price: 549, tags: ['主流', '剪辑'], specs: { type: 'DDR4', size: 32, sticks: 2, speed: 3600 } },
  { id: 'ram-ddr5-16', category: 'ram', name: '金士顿 16GB(2x8) DDR5 5600', brand: '通用', price: 449, tags: ['主流'], specs: { type: 'DDR5', size: 16, sticks: 2, speed: 5600 } },
  { id: 'ram-ddr5-32', category: 'ram', name: '芝奇 32GB(2x16) DDR5 6000', brand: '通用', price: 799, tags: ['主流', '游戏'], specs: { type: 'DDR5', size: 32, sticks: 2, speed: 6000 } },
  { id: 'ram-ddr5-32-6400', category: 'ram', name: '芝奇皇家戟 32GB(2x16) DDR5 6400', brand: '通用', price: 1199, tags: ['高端', '超频', 'RGB'], specs: { type: 'DDR5', size: 32, sticks: 2, speed: 6400 } },
  { id: 'ram-ddr5-48', category: 'ram', name: '英睿达 48GB(2x24) DDR5 5600', brand: '通用', price: 999, tags: ['AI', '剪辑'], specs: { type: 'DDR5', size: 48, sticks: 2, speed: 5600 } },
  { id: 'ram-ddr5-64', category: 'ram', name: '芝奇 64GB(2x32) DDR5 6400', brand: '通用', price: 1699, tags: ['高端', 'AI', '剪辑'], specs: { type: 'DDR5', size: 64, sticks: 2, speed: 6400 } },
  { id: 'ram-ddr5-128', category: 'ram', name: '海盗船 128GB(4x32) DDR5 6000', brand: '通用', price: 3699, tags: ['旗舰', 'AI', '工作站'], specs: { type: 'DDR5', size: 128, sticks: 4, speed: 6000 } },

  // ===== 高频 / CUDIMM 内存 (Core Ultra 200S 配套) =====
  { id: 'ram-ddr5-32-8000', category: 'ram', name: '芝奇皇家戟 32GB(2x16) DDR5 8000 CUDIMM', brand: '通用', price: 1599, tags: ['高端', '超频', 'CUDIMM', '2024'], specs: { type: 'DDR5', size: 32, sticks: 2, speed: 8000 } },
  { id: 'ram-ddr5-48-6400', category: 'ram', name: '英睿达 48GB(2x24) DDR5 6400', brand: '通用', price: 1299, tags: ['AI', '剪辑', '2024'], specs: { type: 'DDR5', size: 48, sticks: 2, speed: 6400 } },
  { id: 'ram-ddr5-64-7200', category: 'ram', name: '芝奇 64GB(2x32) DDR5 7200', brand: '通用', price: 2199, tags: ['高端', 'AI', '超频'], specs: { type: 'DDR5', size: 64, sticks: 2, speed: 7200 } },
  { id: 'ram-ddr5-96-6000', category: 'ram', name: '金士顿 FURY 96GB(2x48) DDR5 6000', brand: '通用', price: 2499, tags: ['AI', '工作站', '2024'], specs: { type: 'DDR5', size: 96, sticks: 2, speed: 6000 } },

  // ===================== 硬盘 (10 件) =====================
  { id: 'ssd-512g', category: 'storage', name: '三星 980 500GB NVMe', brand: '通用', price: 279, tags: ['入门'], specs: { type: 'NVMe', size: 512, interface: 'PCIe 3.0' } },
  { id: 'ssd-1t', category: 'storage', name: '三星 980 1TB NVMe', brand: '通用', price: 459, tags: ['主流'], specs: { type: 'NVMe', size: 1024, interface: 'PCIe 3.0' } },
  { id: 'ssd-1t-p4', category: 'storage', name: '三星 990 EVO 1TB NVMe', brand: '通用', price: 599, tags: ['主流', '高速'], specs: { type: 'NVMe', size: 1024, interface: 'PCIe 4.0' } },
  { id: 'ssd-2t', category: 'storage', name: '三星 990 PRO 2TB NVMe', brand: '通用', price: 1099, tags: ['高端', '游戏', '剪辑'], specs: { type: 'NVMe', size: 2048, interface: 'PCIe 4.0' } },
  { id: 'ssd-2t-5', category: 'storage', name: '三星 9100 PRO 2TB PCIe 5.0', brand: '通用', price: 1499, tags: ['旗舰', 'PCIe5'], specs: { type: 'NVMe', size: 2048, interface: 'PCIe 5.0' } },
  { id: 'ssd-4t', category: 'storage', name: '致钛 TiPlus7100 4TB NVMe', brand: '通用', price: 2199, tags: ['高端', '大容量'], specs: { type: 'NVMe', size: 4096, interface: 'PCIe 4.0' } },
  { id: 'ssd-sn850x-2t', category: 'storage', name: '西部数据 SN850X 2TB NVMe', brand: '通用', price: 1299, tags: ['高端', '游戏'], specs: { type: 'NVMe', size: 2048, interface: 'PCIe 4.0' } },
  { id: 'ssd-mp600-2t', category: 'storage', name: '海盗船 MP600 PRO 2TB', brand: '通用', price: 1199, tags: ['高端'], specs: { type: 'NVMe', size: 2048, interface: 'PCIe 4.0' } },
  { id: 'hdd-2t', category: 'storage', name: '希捷 酷鹰 2TB 机械硬盘', brand: '通用', price: 379, tags: ['大容量', '存储'], specs: { type: 'HDD', size: 2048, interface: 'SATA' } },
  { id: 'hdd-4t', category: 'storage', name: '希捷 酷鹰 4TB 机械硬盘', brand: '通用', price: 599, tags: ['大容量', '存储'], specs: { type: 'HDD', size: 4096, interface: 'SATA' } },

  // ===== PCIe 5.0 SSD 与新一代 SSD =====
  { id: 'ssd-9100pro-4t', category: 'storage', name: '三星 9100 PRO 4TB PCIe 5.0', brand: '通用', price: 3299, tags: ['旗舰', 'PCIe5', '2024'], specs: { type: 'NVMe', size: 4096, interface: 'PCIe 5.0' } },
  { id: 'ssd-tipro-2t', category: 'storage', name: '致钛 TiPro9000 2TB PCIe 5.0', brand: '通用', price: 1499, tags: ['高端', 'PCIe5', '国货', '2024'], specs: { type: 'NVMe', size: 2048, interface: 'PCIe 5.0' } },
  { id: 'ssd-sn8100-2t', category: 'storage', name: '西部数据 SN8100 2TB PCIe 5.0', brand: '通用', price: 1399, tags: ['高端', 'PCIe5', '2024'], specs: { type: 'NVMe', size: 2048, interface: 'PCIe 5.0' } },
  { id: 'ssd-p7000z-2t', category: 'storage', name: '爱国者 P7000Z 2TB', brand: '通用', price: 999, tags: ['主流', '性价比', '2024'], specs: { type: 'NVMe', size: 2048, interface: 'PCIe 4.0' } },

  // ===================== 电源 (10 件) =====================
  { id: 'psu-450w', category: 'psu', name: '航嘉 GX500 500W 铜牌', brand: '通用', price: 269, tags: ['入门'], specs: { wattage: 500, rating: '80Plus Bronze' } },
  { id: 'psu-550w', category: 'psu', name: '长城 G5 550W 铜牌', brand: '通用', price: 349, tags: ['入门'], specs: { wattage: 550, rating: '80Plus Bronze' } },
  { id: 'psu-650w', category: 'psu', name: '海韵 FOCUS GX-650 金牌', brand: '通用', price: 549, tags: ['主流'], specs: { wattage: 650, rating: '80Plus Gold' } },
  { id: 'psu-650w-w', category: 'psu', name: '酷冷至尊 GX2 650W 金牌', brand: '通用', price: 479, tags: ['主流', '性价比'], specs: { wattage: 650, rating: '80Plus Gold' } },
  { id: 'psu-750w', category: 'psu', name: '振华 LEADEX III 750W 金牌', brand: '通用', price: 649, tags: ['主流'], specs: { wattage: 750, rating: '80Plus Gold' } },
  { id: 'psu-850w', category: 'psu', name: '海韵 FOCUS GX-850 金牌', brand: '通用', price: 799, tags: ['高端'], specs: { wattage: 850, rating: '80Plus Gold' } },
  { id: 'psu-850w-t', category: 'psu', name: '华硕 TUF 850W 金牌', brand: '通用', price: 899, tags: ['高端', '耐用'], specs: { wattage: 850, rating: '80Plus Gold' } },
  { id: 'psu-1000w', category: 'psu', name: '海盗船 RM1000x 金牌', brand: '通用', price: 1199, tags: ['高端', 'AI'], specs: { wattage: 1000, rating: '80Plus Gold' } },
  { id: 'psu-1200w', category: 'psu', name: '华硕 ROG STRIX 1200W 白金', brand: '通用', price: 1899, tags: ['旗舰', 'AI'], specs: { wattage: 1200, rating: '80Plus Platinum' } },
  { id: 'psu-1300w', category: 'psu', name: '海韵 PRIME TX-1300 钛金', brand: '通用', price: 2599, tags: ['旗舰', '4090'], specs: { wattage: 1300, rating: '80Plus Titanium' } },

  // ===== ATX 3.1 / 12V-2x6 16pin 电源 (RTX 5090 必备) =====
  { id: 'psu-1000w-atx31', category: 'psu', name: '微星 MAG A1000GL PCIE5 ATX 3.1', brand: '通用', price: 1299, tags: ['高端', 'ATX3.1', '16pin', '2024'], specs: { wattage: 1000, rating: '80Plus Gold' } },
  { id: 'psu-1200w-atx31', category: 'psu', name: '振华 LEADEX VII 1200W ATX 3.1 白金', brand: '通用', price: 1799, tags: ['旗舰', 'ATX3.1', '16pin', '2024'], specs: { wattage: 1200, rating: '80Plus Platinum' } },
  { id: 'psu-1300w-atx31', category: 'psu', name: '海韵 PRIME PX-1300 ATX 3.1 白金', brand: '通用', price: 2299, tags: ['旗舰', 'ATX3.1', '16pin', '5090'], specs: { wattage: 1300, rating: '80Plus Platinum' } },
  { id: 'psu-1600w-atx31', category: 'psu', name: '海盗船 AX1600i ATX 3.1 钛金', brand: '通用', price: 3499, tags: ['旗舰', 'ATX3.1', '16pin', '双5090'], specs: { wattage: 1600, rating: '80Plus Titanium' } },

  // ===================== 机箱 (10 件) =====================
  { id: 'case-matx-cmd', category: 'case', name: '先马 平头哥 M1 mATX', brand: '通用', price: 169, tags: ['入门', 'mATX'], specs: { formFactor: ['mATX', 'ITX'], maxGpuLength: 320 } },
  { id: 'case-matx-2', category: 'case', name: '鑫谷 开元 K7 mATX', brand: '通用', price: 249, tags: ['入门', 'mATX'], specs: { formFactor: ['mATX', 'ITX'], maxGpuLength: 340 } },
  { id: 'case-air3', category: 'case', name: '联力 包豪斯 AIR 3', brand: '通用', price: 599, tags: ['主流', 'ATX'], specs: { formFactor: ['ATX', 'mATX', 'ITX'], maxGpuLength: 360 } },
  { id: 'case-011', category: 'case', name: '联力 011 Dynamic', brand: '通用', price: 899, tags: ['高端', 'E-ATX'], specs: { formFactor: ['E-ATX', 'ATX', 'mATX', 'ITX'], maxGpuLength: 420 } },
  { id: 'case-h7', category: 'case', name: '恩杰 NZXT H7 Flow', brand: '通用', price: 749, tags: ['主流', 'ATX'], specs: { formFactor: ['ATX', 'mATX', 'ITX'], maxGpuLength: 400 } },
  { id: 'case-h9-flow', category: 'case', name: '恩杰 NZXT H9 Flow', brand: '通用', price: 1099, tags: ['高端', 'ATX', '海景房'], specs: { formFactor: ['E-ATX', 'ATX', 'mATX', 'ITX'], maxGpuLength: 435 } },
  { id: 'case-o11d', category: 'case', name: '联力 011 Dynamic EVO', brand: '通用', price: 1299, tags: ['高端', '海景房'], specs: { formFactor: ['E-ATX', 'ATX', 'mATX', 'ITX'], maxGpuLength: 422 } },
  { id: 'case-sunmudao', category: 'case', name: '乔思伯 D40 黑色 ATX', brand: '通用', price: 469, tags: ['主流', 'ATX'], specs: { formFactor: ['ATX', 'mATX', 'ITX'], maxGpuLength: 360 } },
  { id: 'case-itx-a4', category: 'case', name: '超频三 蜂鸟 ITX 机箱', brand: '通用', price: 299, tags: ['ITX', '小型'], specs: { formFactor: ['ITX'], maxGpuLength: 320 } },
  { id: 'case-hs1', category: 'case', name: '分形工艺 North', brand: '通用', price: 1399, tags: ['高端', '颜值'], specs: { formFactor: ['E-ATX', 'ATX', 'mATX', 'ITX'], maxGpuLength: 415 } },

  // ===== 2024 新机箱 =====
  { id: 'case-o11-vision', category: 'case', name: '联力 O11 Vision', brand: '通用', price: 1499, tags: ['高端', '海景房', 'E-ATX', '2024'], specs: { formFactor: ['E-ATX', 'ATX', 'mATX', 'ITX'], maxGpuLength: 452 } },
  { id: 'case-tuf-gt302', category: 'case', name: '华硕 TUF Gaming GT302', brand: '通用', price: 599, tags: ['主流', 'ATX', '4 风扇位', '2024'], specs: { formFactor: ['ATX', 'mATX', 'ITX'], maxGpuLength: 380 } },
  { id: 'case-c28', category: 'case', name: '联力 LANCOOL 216', brand: '通用', price: 549, tags: ['主流', 'ATX', '散热强'], specs: { formFactor: ['E-ATX', 'ATX', 'mATX', 'ITX'], maxGpuLength: 392 } },
  { id: 'case-air3-xl', category: 'case', name: '联力 包豪斯 AIR 3 XL', brand: '通用', price: 999, tags: ['高端', 'E-ATX', '海景房'], specs: { formFactor: ['E-ATX', 'ATX', 'mATX', 'ITX'], maxGpuLength: 460 } },

  // ===================== 散热器 (8 件) =====================
  { id: 'cooler-air-t400', category: 'cooler', name: '利民 AX120R SE 单塔', brand: '通用', price: 99, tags: ['入门'], specs: { type: 'Air', height: 148, supportedSockets: ['LGA1700', 'LGA1851', 'AM5', 'AM4'], maxTdp: 180 } },
  { id: 'cooler-air-ak120', category: 'cooler', name: '利民 PA120 SE 双塔', brand: '通用', price: 269, tags: ['主流', '性价比'], specs: { type: 'Air', height: 155, supportedSockets: ['LGA1700', 'LGA1851', 'AM5', 'AM4'], maxTdp: 245 } },
  { id: 'cooler-air-d15', category: 'cooler', name: '猫头鹰 NH-D15 双塔', brand: '通用', price: 899, tags: ['高端', '静音', '风冷王者'], specs: { type: 'Air', height: 165, supportedSockets: ['LGA1700', 'LGA1851', 'AM5', 'AM4'], maxTdp: 250 } },
  { id: 'cooler-air-u12a', category: 'cooler', name: '猫头鹰 NH-U12A 单塔', brand: '通用', price: 729, tags: ['高端', '静音'], specs: { type: 'Air', height: 158, supportedSockets: ['LGA1700', 'LGA1851', 'AM5', 'AM4'], maxTdp: 230 } },
  { id: 'cooler-aio-240', category: 'cooler', name: '利民 Frozen MAGIC 240 一体水冷', brand: '通用', price: 449, tags: ['主流', 'RGB'], specs: { type: 'AIO', radiator: 240, supportedSockets: ['LGA1700', 'LGA1851', 'AM5', 'AM4'], maxTdp: 250 } },
  { id: 'cooler-aio-360', category: 'cooler', name: '瓦尔基里 GL360 一体水冷', brand: '通用', price: 799, tags: ['高端'], specs: { type: 'AIO', radiator: 360, supportedSockets: ['LGA1700', 'LGA1851', 'AM5', 'AM4'], maxTdp: 280 } },
  { id: 'cooler-aio-360-argb', category: 'cooler', name: '利民 Frozen Infinity 360 ARGB', brand: '通用', price: 899, tags: ['高端', 'RGB', '性价比'], specs: { type: 'AIO', radiator: 360, supportedSockets: ['LGA1700', 'LGA1851', 'AM5', 'AM4'], maxTdp: 280 } },
  { id: 'cooler-aio-420', category: 'cooler', name: '华硕 ROG RYUJIN III 360 ARGB', brand: '通用', price: 1899, tags: ['旗舰', 'RGB', 'OLED'], specs: { type: 'AIO', radiator: 360, supportedSockets: ['LGA1700', 'LGA1851', 'AM5'], maxTdp: 320 } },

  // ===== 2024 新散热器 =====
  { id: 'cooler-air-d15g2', category: 'cooler', name: '猫头鹰 NH-D15 G2', brand: '通用', price: 1199, tags: ['旗舰', '静音', '风冷王者', '2024'], specs: { type: 'Air', height: 168, supportedSockets: ['LGA1700', 'LGA1851', 'AM5', 'AM4'], maxTdp: 300 } },
  { id: 'cooler-aio-gl360v2', category: 'cooler', name: '瓦尔基里 GL360 V2 一体水冷', brand: '通用', price: 1099, tags: ['旗舰', 'OLED', '2024'], specs: { type: 'AIO', radiator: 360, supportedSockets: ['LGA1700', 'LGA1851', 'AM5', 'AM4'], maxTdp: 300 } },
  { id: 'cooler-air-assassin4', category: 'cooler', name: '九州风神 ASSASSIN IV 风冷', brand: '通用', price: 549, tags: ['高端', '静音', '性价比'], specs: { type: 'Air', height: 164, supportedSockets: ['LGA1700', 'LGA1851', 'AM5', 'AM4'], maxTdp: 280 } },
  { id: 'cooler-aio-360-rog', category: 'cooler', name: '华硕 ROG STRIX LC III 360 ARGB', brand: '通用', price: 1499, tags: ['旗舰', 'RGB', '2024'], specs: { type: 'AIO', radiator: 360, supportedSockets: ['LGA1700', 'LGA1851', 'AM5'], maxTdp: 320 } },

  // ===================== 机箱风扇 (8 件) =====================
  // 风扇不需要兼容性检查（任意机箱可装），但保留 specs 用于推荐
  { id: 'fan-p12', category: 'fan', name: '猫头鹰 NF-P12 redux 1200', brand: '通用', price: 99, tags: ['静音', '无光'], specs: { size: 120, rgb: false, maxRpm: 1300, airflow: 64 } },
  { id: 'fan-a12', category: 'fan', name: '猫头鹰 NF-A12x25 2000RPM', brand: '通用', price: 199, tags: ['旗舰', '静音', '无光'], specs: { size: 120, rgb: false, maxRpm: 2000, airflow: 102 } },
  { id: 'fan-tl-b12', category: 'fan', name: '利民 TL-B12 120mm', brand: '通用', price: 49, tags: ['性价比', '无光'], specs: { size: 120, rgb: false, maxRpm: 1800, airflow: 78 } },
  { id: 'fan-tl-r12', category: 'fan', name: '利民 TL-R12 120mm ARGB', brand: '通用', price: 79, tags: ['性价比', 'RGB'], specs: { size: 120, rgb: true, maxRpm: 1800, airflow: 78 } },
  { id: 'fan-c12l', category: 'fan', name: '九州风神 CF120 120mm ARGB 三联包', brand: '通用', price: 219, tags: ['套装', 'RGB'], specs: { size: 120, rgb: true, maxRpm: 1500, airflow: 67, pack: 3 } },
  { id: 'fan-c14', category: 'fan', name: '九州风神 CF140 140mm ARGB 双联包', brand: '通用', price: 199, tags: ['套装', 'RGB', '140mm'], specs: { size: 140, rgb: true, maxRpm: 1500, airflow: 97, pack: 2 } },
  { id: 'fan-uni-fan', category: 'fan', name: '联力 UNI FAN SL-INF 120 三联包', brand: '通用', price: 459, tags: ['高端', '套装', 'RGB', '菊花链'], specs: { size: 120, rgb: true, maxRpm: 2100, airflow: 80, pack: 3 } },
  { id: 'fan-mag', category: 'fan', name: '微星 MEG SILENT GALE P12 三联包', brand: '通用', price: 369, tags: ['高端', '静音', '套装'], specs: { size: 120, rgb: false, maxRpm: 2000, airflow: 84, pack: 3 } },

  // ===== 2024 新风扇 =====
  { id: 'fan-uni-fan-v3', category: 'fan', name: '联力 UNI FAN SL V3 120 三联包', brand: '通用', price: 599, tags: ['旗舰', '套装', 'RGB', '2024'], specs: { size: 120, rgb: true, maxRpm: 2400, airflow: 90, pack: 3 } },
  { id: 'fan-a14-ippc', category: 'fan', name: '猫头鹰 NF-A14 industrialPPC-3000', brand: '通用', price: 269, tags: ['旗舰', '工业级', '高风压'], specs: { size: 140, rgb: false, maxRpm: 3000, airflow: 158 } },
  { id: 'fan-tl-k12', category: 'fan', name: '利民 TL-K12 120mm 白色 ARGB', brand: '通用', price: 99, tags: ['白色', 'RGB', '性价比'], specs: { size: 120, rgb: true, maxRpm: 1900, airflow: 82 } }
];

/** 按分类获取硬件 */
export function getByCategory(category) {
  return HARDWARE_DB.filter((h) => h.category === category);
}

/** 按 id 查找硬件 */
export function getById(id) {
  return HARDWARE_DB.find((h) => h.id === id);
}
