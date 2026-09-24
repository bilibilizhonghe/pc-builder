/**
 * 应用根组件
 * - 顶部标题
 * - 智能推荐表单
 * - 左右分栏：左侧分类选择、右侧实时配置单
 * - 弹窗（选择硬件时 / 京东SKU绑定）
 */
import { useState } from 'react';
import { useBuildStore } from './store/useBuildStore.js';
import CategorySelector from './components/CategorySelector.jsx';
import BuildSummary from './components/BuildSummary.jsx';
import RecommendationForm from './components/RecommendationForm.jsx';
import HardwarePicker from './components/HardwarePicker.jsx';
import JdLinkBinder from './components/JdLinkBinder.jsx';
import JdPriceImporter from './components/JdPriceImporter.jsx';

export default function App() {
  const pickerOpen = useBuildStore((s) => s.pickerOpen);
  const activeCategory = useBuildStore((s) => s.activeCategory);
  const build = useBuildStore((s) => s.build);
  const selectPart = useBuildStore((s) => s.selectPart);
  const closePicker = useBuildStore((s) => s.closePicker);

  const [binderOpen, setBinderOpen] = useState(false);
  const [importerOpen, setImporterOpen] = useState(false);

  return (
    <div className="min-h-screen text-slate-100">
      {/* 顶部标题区 */}
      <header className="relative overflow-hidden border-b border-cyan-500/20 bg-tech-gradient">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-cyan-300 to-accent-400 bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl">
                ⚡ 极客装机 · PC Builder
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                智能推荐 · 实时报价 · 京东价格同步 · 兼容性自动检测
              </p>
            </div>
            <div className="hidden sm:block">
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                v1.1 · JD Live
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* 智能推荐 */}
        <RecommendationForm />

        {/* 左右分栏 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 左侧：分类选择 */}
          <section className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-cyan-300">自定义虚拟装机</h2>
              <span className="text-xs text-slate-500">点击分类卡片选择或更换配件</span>
            </div>
            <CategorySelector />
          </section>

          {/* 右侧：实时配置单 */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6">
              <BuildSummary
                onOpenBinder={() => setBinderOpen(true)}
                onOpenImporter={() => setImporterOpen(true)}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* 底部 */}
      <footer className="border-t border-cyan-500/20 py-6 text-center text-xs text-slate-500">
        Built with React + Vite + Tailwind + Zustand · 京东价通过 p.3.cn 接口实时同步
      </footer>

      {/* 硬件选择弹窗 */}
      {pickerOpen && activeCategory && (
        <HardwarePicker
          category={activeCategory}
          currentBuild={build}
          onSelect={(part) => {
            selectPart(activeCategory, part);
            closePicker();
          }}
          onClose={closePicker}
        />
      )}

      {/* 京东 SKU 绑定弹窗 */}
      <JdLinkBinder open={binderOpen} onClose={() => setBinderOpen(false)} />

      {/* 真实价格导入弹窗 */}
      <JdPriceImporter open={importerOpen} onClose={() => setImporterOpen(false)} />
    </div>
  );
}
