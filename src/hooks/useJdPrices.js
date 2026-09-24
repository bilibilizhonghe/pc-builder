/**
 * 京东实时价 Hook
 * 数据源优先级：localStorage 导入 > 本地缓存文件（cache）> 京东 API > mock fallback
 * - localStorage 导入（imported）：用户在 UI 粘贴的
 * - 本地缓存（cache）：npm run fetch-prices 抓取的 → 视为"已验证真实"
 * - 京东 API（jd）：实时拉取
 * - mock / mock-fallback：兜底演示
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchJdPrices, refreshJdPrices } from '../api/jd.js';
import { loadImportedPrices } from '../utils/jdPriceImporter.js';

export function useJdPrices(skus) {
  const [priceMap, setPriceMap] = useState({});
  const [source, setSource] = useState('jd');
  const [loading, setLoading] = useState(false);
  const [lastFetchAt, setLastFetchAt] = useState(null);
  const reqIdRef = useRef(0);

  const skuKey = skus.filter(Boolean).sort().join(',');

  const run = useCallback(
    async (force = false) => {
      if (skus.length === 0) {
        setPriceMap({});
        setSource('jd');
        return;
      }
      const myId = ++reqIdRef.current;
      setLoading(true);

      try {
        // 1) 优先：localStorage 导入
        const imported = loadImportedPrices();
        const fromImport = {};
        let importHit = 0;
        for (const sku of skus) {
          if (imported[sku]) {
            fromImport[sku] = imported[sku];
            importHit += 1;
          }
        }

        // 2) 缺失走 API（API 内部会优先用 cache，再走 p.3.cn，再 mock fallback）
        const missing = skus.filter((s) => !fromImport[s]);
        let fromApi = {};
        let apiSource = 'jd';
        if (missing.length > 0) {
          const { priceMap: apiMap, source: src } = force
            ? await refreshJdPrices(missing)
            : await fetchJdPrices(missing);
          fromApi = apiMap;
          apiSource = src;
        }

        if (myId !== reqIdRef.current) return;

        // 合并
        const merged = { ...fromApi, ...fromImport };
        setPriceMap(merged);

        // 决定 source 标签
        if (importHit === skus.length) {
          setSource('imported');
        } else if (importHit > 0) {
          setSource(apiSource.startsWith('mock') ? 'imported-partial-mock' : 'imported-partial');
        } else {
          setSource(apiSource);
        }

        setLastFetchAt(Date.now());
      } finally {
        if (myId === reqIdRef.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [skuKey]
  );

  useEffect(() => {
    run(false);
  }, [run]);

  // 状态机
  const states = {};
  skus.forEach((sku) => {
    if (!sku) states[sku] = 'idle';
    else if (loading && priceMap[sku] === undefined) states[sku] = 'loading';
    else if (priceMap[sku] === null) states[sku] = 'unavailable';
    else if (priceMap[sku]) states[sku] = 'success';
    else states[sku] = 'loading';
  });

  // 是否命中"已验证真实"：imported / cache / jd 任一即可
  const isMock = source.startsWith('mock');
  const isImported = source === 'imported' || source.startsWith('imported-partial');
  const isCache = source === 'cache' || source.startsWith('cache+');
  const isVerified = isImported || isCache || source === 'jd' || source === 'cache+j' || source === 'jd-partial';

  return {
    priceMap,
    states,
    loading,
    source,
    isMock,
    isImported,
    isCache,
    isVerified,
    lastFetchAt,
    refresh: () => run(true)
  };
}
