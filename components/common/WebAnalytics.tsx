"use client";

import React from "react";

interface AnalyticsConfig {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  enableHotjar?: boolean;
}

interface WebAnalyticsProps {
  config: AnalyticsConfig;
}

export default function WebAnalytics({ config }: WebAnalyticsProps) {
  React.useEffect(() => {
    // Google Analytics
    if (config.googleAnalyticsId && typeof window !== "undefined") {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
      document.head.appendChild(script);

      const configScript = document.createElement("script");
      configScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.googleAnalyticsId}');
      `;
      document.head.appendChild(configScript);
    }

    // Facebook Pixel
    if (config.facebookPixelId && typeof window !== "undefined") {
      const fbScript = document.createElement("script");
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${config.facebookPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    }

    // Hotjar
    if (config.enableHotjar && typeof window !== "undefined") {
      const hjScript = document.createElement("script");
      hjScript.innerHTML = `
        (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `;
      document.head.appendChild(hjScript);
    }
  }, [config]);

  return null; // This component doesn't render anything
}

// Analytics helper functions
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, properties);
  }

  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", eventName, properties);
  }
};

export const trackPurchase = (
  value: number,
  currency = "VND",
  items?: any[]
) => {
  trackEvent("purchase", {
    value,
    currency,
    items,
  });
};

export const trackAddToCart = (
  productId: string,
  productName: string,
  value: number
) => {
  trackEvent("add_to_cart", {
    currency: "VND",
    value,
    items: [
      {
        item_id: productId,
        item_name: productName,
        currency: "VND",
        value,
      },
    ],
  });
};

export const trackViewProduct = (
  productId: string,
  productName: string,
  category?: string
) => {
  trackEvent("view_item", {
    currency: "VND",
    items: [
      {
        item_id: productId,
        item_name: productName,
        item_category: category,
      },
    ],
  });
};
