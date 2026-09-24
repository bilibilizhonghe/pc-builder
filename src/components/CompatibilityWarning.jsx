/**
 * 兼容性警告条
 * 显示当前配置的所有错误与警告
 */
export default function CompatibilityWarning({ compatibility }) {
  const { errors = [], warnings = [] } = compatibility || {};
  if (errors.length === 0 && warnings.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
        <span className="font-semibold">✓ 兼容性良好</span> · 所有硬件搭配无冲突，可以下单装机。
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {errors.map((msg, i) => (
        <div
          key={`err-${i}`}
          className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-red-500 shadow-glow" />
          <div>
            <div className="font-semibold text-red-200">兼容性错误</div>
            <div className="text-red-300/90">{msg}</div>
          </div>
        </div>
      ))}
      {warnings.map((msg, i) => (
        <div
          key={`warn-${i}`}
          className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
        >
          <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-amber-400" />
          <div>
            <div className="font-semibold text-amber-100">建议注意</div>
            <div className="text-amber-200/90">{msg}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
