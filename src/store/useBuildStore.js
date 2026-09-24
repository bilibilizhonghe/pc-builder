/**
 * 全局装机配置状态
 * 使用 Zustand 管理：
 *  - build: 已选硬件对象 { cpu, motherboard, gpu, ram, storage, psu, case, cooler }
 *  - 增删改、清空、批量替换
 *  - 实时总价（由 selector 计算）
 */

import { create } from 'zustand';
import { CATEGORIES } from '../data/hardware.js';
import { checkCompatibility } from '../utils/compatibility.js';

export const useBuildStore = create((set, get) => ({
  // 已选硬件：键为 category，值为硬件对象
  build: {
    cpu: null,
    motherboard: null,
    gpu: null,
    ram: null,
    storage: null,
    psu: null,
    case: null,
    cooler: null,
    fan: null
  },

  // 当前选中的分类（用于弹窗显示该分类的硬件列表）
  activeCategory: null,

  // 弹窗是否打开
  pickerOpen: false,

  /** 设置某一分类的硬件 */
  selectPart: (category, part) =>
    set((state) => ({
      build: { ...state.build, [category]: part }
    })),

  /** 移除某分类的硬件 */
  removePart: (category) =>
    set((state) => ({
      build: { ...state.build, [category]: null }
    })),

  /** 整批替换（用于智能推荐一键写入） */
  setBuild: (newBuild) => set({ build: { ...newBuild } }),

  /** 清空所有 */
  clearBuild: () =>
    set({
      build: {
        cpu: null,
        motherboard: null,
        gpu: null,
        ram: null,
        storage: null,
        psu: null,
        case: null,
        cooler: null,
        fan: null
      }
    }),

  /** 控制弹窗 */
  openPicker: (category) => set({ activeCategory: category, pickerOpen: true }),
  closePicker: () => set({ pickerOpen: false, activeCategory: null })
}));

/**
 * 派生：总价
 */
export const selectTotal = (state) =>
  CATEGORIES.reduce((sum, cat) => sum + (state.build[cat]?.price ?? 0), 0);

/**
 * 派生：已选数量
 */
export const selectSelectedCount = (state) =>
  CATEGORIES.filter((cat) => state.build[cat]).length;

/**
 * 派生：兼容性检查
 */
export const selectCompatibility = (state) => checkCompatibility(state.build);
