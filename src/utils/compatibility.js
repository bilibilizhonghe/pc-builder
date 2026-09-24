/**
 * 兼容性检测工具
 * 输入：当前已选硬件对象 { cpu, motherboard, gpu, ram, ... }，值均为 hardware.js 中的对象
 * 输出：{ ok: boolean, errors: string[], warnings: string[] }
 *
 * 关键规则：
 *  1. CPU 插槽 vs 主板插槽
 *  2. 内存类型（DDR4/DDR5）vs 主板支持的内存类型
 *  3. 电源功率 >= CPU TDP + GPU TDP + 其他 150W 余量
 *  4. 机箱支持的主板板型 vs 主板实际板型
 *  5. 散热器支持插槽 vs CPU 插槽
 *  6. 显卡长度 vs 机箱最大支持长度
 */

import { CATEGORIES } from '../data/hardware.js';

// 估算其它部件（风扇、灯板、风冷/水冷外设等）的固定功耗
const OTHER_WATTAGE = 80;
// 额外余量（保证电源不长时间满载）
const PSU_HEADROOM = 150;

export function checkCompatibility(build) {
  const errors = []; // 严重错误（必须解决，阻止加入）
  const warnings = []; // 警告（不阻止，但建议注意）

  const { cpu, motherboard, gpu, ram, psu, case: pcCase, cooler } = build;

  // 1. CPU 与主板插槽一致性
  if (cpu && motherboard) {
    if (cpu.specs.socket !== motherboard.specs.socket) {
      errors.push(
        `CPU 插槽 ${cpu.specs.socket} 与主板插槽 ${motherboard.specs.socket} 不匹配`
      );
    }
    // CPU 与主板品牌阵营仅作建议
    if (cpu.brand !== motherboard.brand) {
      warnings.push(
        `CPU 阵营 ${cpu.brand} 与主板阵营 ${motherboard.brand} 混搭（不影响使用，但建议留意 BIOS 更新）`
      );
    }
  }

  // 2. 内存类型与主板匹配
  if (ram && motherboard) {
    if (ram.specs.type !== motherboard.specs.ramType) {
      errors.push(
        `内存类型 ${ram.specs.type} 与主板支持的 ${motherboard.specs.ramType} 不匹配`
      );
    }
    // 内存总容量不能超过主板上限
    if (motherboard.specs.maxRam && ram.specs.size > motherboard.specs.maxRam) {
      errors.push(
        `内存容量 ${ram.specs.size}GB 超过主板最大支持 ${motherboard.specs.maxRam}GB`
      );
    }
  }

  // 3. 电源功率估算
  if (psu) {
    const cpuTdp = cpu?.specs?.tdp ?? 0;
    const gpuTdp = gpu?.specs?.tdp ?? 0;
    const required = cpuTdp + gpuTdp + OTHER_WATTAGE + PSU_HEADROOM;
    if (psu.specs.wattage < required) {
      errors.push(
        `电源功率 ${psu.specs.wattage}W 不足：CPU(${cpuTdp}W) + GPU(${gpuTdp}W) + 其它 ≈ ${required}W`
      );
    } else if (psu.specs.wattage < required + 100) {
      warnings.push(
        `电源功率 ${psu.specs.wattage}W 略高于推荐值 ${required}W，建议留更多余量`
      );
    }
  }

  // 4. 机箱支持的主板板型
  if (pcCase && motherboard) {
    const supported = pcCase.specs.formFactor || [];
    if (!supported.includes(motherboard.specs.formFactor)) {
      errors.push(
        `机箱不支持 ${motherboard.specs.formFactor} 板型主板（仅支持 ${supported.join('/')}）`
      );
    }
  }

  // 5. 散热器插槽支持
  if (cooler && cpu) {
    const supported = cooler.specs.supportedSockets || [];
    if (!supported.includes(cpu.specs.socket)) {
      errors.push(
        `散热器不支持 ${cpu.specs.socket} 插槽（仅支持 ${supported.join('/')}）`
      );
    }
    // 散热能力
    if (cooler.specs.maxTdp && cpu.specs.tdp > cooler.specs.maxTdp) {
      warnings.push(
        `CPU TDP ${cpu.specs.tdp}W 高于散热器标称散热 ${cooler.specs.maxTdp}W`
      );
    }
  }

  // 6. 机箱最大显卡长度
  if (pcCase && gpu) {
    if (gpu.specs.length && pcCase.specs.maxGpuLength && gpu.specs.length > pcCase.specs.maxGpuLength) {
      errors.push(
        `显卡长度 ${gpu.specs.length}mm 超过机箱最大支持 ${pcCase.specs.maxGpuLength}mm`
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 判断"单件加入"是否会立即触发错误
 * 用于在弹窗中给单条硬件标红 / 禁用
 * 主要检查：CPU↔主板、内存↔主板、CPU↔散热器
 */
export function checkSinglePartCompatibility(part, currentBuild) {
  const trial = { ...currentBuild, [part.category]: part };
  const full = checkCompatibility(trial);
  // 仅返回与 part 相关的错误
  return full.errors.filter((msg) => {
    if (part.category === 'cpu') {
      return msg.includes('CPU') || msg.includes('插槽') || msg.includes('TDP');
    }
    if (part.category === 'motherboard') {
      return msg.includes('插槽') || msg.includes('内存') || msg.includes('板型');
    }
    if (part.category === 'ram') {
      return msg.includes('内存');
    }
    if (part.category === 'gpu') {
      return msg.includes('显卡') || msg.includes('电源');
    }
    if (part.category === 'psu') {
      return msg.includes('电源');
    }
    if (part.category === 'case') {
      return msg.includes('机箱') || msg.includes('板型') || msg.includes('显卡长度');
    }
    if (part.category === 'cooler') {
      return msg.includes('散热') || msg.includes('插槽');
    }
    return false;
  });
}

export { CATEGORIES };
