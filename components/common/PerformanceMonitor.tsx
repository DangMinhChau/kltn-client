"use client";

import { useEffect } from "react";

export const PerformanceMonitor = () => {
  useEffect(() => {
    // Monitor page load performance
    if (typeof window !== "undefined") {
      const measurePageLoad = () => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;

        if (navigation) {
          const metrics = {
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
            ssl: navigation.connectEnd - navigation.secureConnectionStart,
            ttfb: navigation.responseStart - navigation.requestStart,
            download: navigation.responseEnd - navigation.responseStart,
            domParse:
              navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart,
            totalLoad: navigation.loadEventEnd - navigation.navigationStart,
          };

          console.log("📊 Page Performance Metrics:", metrics);
        }
      };

      // Wait for the page to fully load
      if (document.readyState === "complete") {
        measurePageLoad();
      } else {
        window.addEventListener("load", measurePageLoad);
        return () => window.removeEventListener("load", measurePageLoad);
      }
    }
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;
