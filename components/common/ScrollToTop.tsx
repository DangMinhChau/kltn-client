"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      // Calculate scroll progress
      const scrolled = window.scrollY;
      const maxHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxHeight) * 100;

      setScrollProgress(progress);
      setIsVisible(scrolled > 300);
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={scrollToTop}
        size="lg"
        className={cn(
          "w-14 h-14 rounded-full shadow-lg hover:shadow-xl",
          "bg-primary hover:bg-primary/90 text-white",
          "border-2 border-white/20 backdrop-blur-sm",
          "transition-all duration-300 transform hover:scale-110",
          "relative overflow-hidden group"
        )}
        aria-label="Scroll to top"
      >
        {/* Progress Circle */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 56 56"
        >
          <circle
            cx="28"
            cy="28"
            r="26"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          <circle
            cx="28"
            cy="28"
            r="26"
            fill="none"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="2"
            strokeDasharray="163.36"
            strokeDashoffset={163.36 - (163.36 * scrollProgress) / 100}
            className="transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>

        {/* Icon */}
        <ChevronUp className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform duration-200" />
      </Button>
    </div>
  );
};

export default ScrollToTop;
