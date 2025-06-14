import { useEffect, useCallback, useRef } from "react";

interface PerformanceMetrics {
  renderTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
}

export const useAuthPerformance = () => {
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    apiResponseTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
  });

  const startTimerRef = useRef<number>(0);
  const apiCallsRef = useRef<{ total: number; cached: number; errors: number }>(
    {
      total: 0,
      cached: 0,
      errors: 0,
    }
  );

  // Start performance measurement
  const startMeasurement = useCallback((label: string) => {
    startTimerRef.current = performance.now();
    performance.mark(`auth-${label}-start`);
  }, []);

  // End performance measurement
  const endMeasurement = useCallback((label: string) => {
    const endTime = performance.now();
    const duration = endTime - startTimerRef.current;

    performance.mark(`auth-${label}-end`);

    try {
      performance.measure(
        `auth-${label}`,
        `auth-${label}-start`,
        `auth-${label}-end`
      );

      // Update metrics based on label type
      if (label.includes("render")) {
        metricsRef.current.renderTime = duration;
      } else if (label.includes("api")) {
        metricsRef.current.apiResponseTime = duration;
      }

      console.log(`Auth Performance - ${label}: ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.warn(`Performance measurement failed for ${label}:`, error);
    }
  }, []);

  // Track API call
  const trackApiCall = useCallback((success: boolean, fromCache = false) => {
    apiCallsRef.current.total += 1;

    if (fromCache) {
      apiCallsRef.current.cached += 1;
    }

    if (!success) {
      apiCallsRef.current.errors += 1;
    }

    // Update metrics
    metricsRef.current.cacheHitRate =
      apiCallsRef.current.total > 0
        ? (apiCallsRef.current.cached / apiCallsRef.current.total) * 100
        : 0;

    metricsRef.current.errorRate =
      apiCallsRef.current.total > 0
        ? (apiCallsRef.current.errors / apiCallsRef.current.total) * 100
        : 0;
  }, []);

  // Get current metrics
  const getMetrics = useCallback(
    () => ({
      ...metricsRef.current,
      totalApiCalls: apiCallsRef.current.total,
      cachedCalls: apiCallsRef.current.cached,
      failedCalls: apiCallsRef.current.errors,
    }),
    []
  );

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      renderTime: 0,
      apiResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
    };

    apiCallsRef.current = {
      total: 0,
      cached: 0,
      errors: 0,
    };
  }, []);

  // Log performance summary on component unmount
  useEffect(() => {
    return () => {
      const metrics = getMetrics();
      console.log("Auth Performance Summary:", metrics);
    };
  }, [getMetrics]);

  return {
    startMeasurement,
    endMeasurement,
    trackApiCall,
    getMetrics,
    resetMetrics,
  };
};
