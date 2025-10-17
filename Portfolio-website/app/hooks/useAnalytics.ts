import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import React from 'react';

export const useAnalytics = () => {
  const pathname = usePathname();

  // Track page view on route change
  useEffect(() => {
    trackEvent('page_view', {
      page: pathname,
      timestamp: new Date().toISOString(),
    });
  }, [pathname]);

  const trackEvent = async (event: string, data?: any) => {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          data: {
            ...data,
            userAgent: navigator.userAgent,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          page: pathname,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      // Silently fail analytics to not affect user experience
      console.warn('Analytics tracking failed:', error);
    }
  };

  const trackProjectView = (projectId: string, projectTitle: string) => {
    trackEvent('project_view', {
      projectId,
      projectTitle,
      page: pathname,
    });
  };

  const trackDownload = (fileName: string, fileUrl: string) => {
    trackEvent('file_download', {
      fileName,
      fileUrl,
      page: pathname,
    });
  };

  const trackExternalLink = (url: string, linkText: string) => {
    trackEvent('external_link_click', {
      url,
      linkText,
      page: pathname,
    });
  };

  const trackFormSubmission = (formName: string, success: boolean) => {
    trackEvent('form_submission', {
      formName,
      success,
      page: pathname,
    });
  };

  const trackScrollDepth = (percentage: number) => {
    trackEvent('scroll_depth', {
      percentage,
      page: pathname,
    });
  };

  const trackTimeOnPage = (timeSpent: number) => {
    trackEvent('time_on_page', {
      timeSpent, // in seconds
      page: pathname,
    });
  };

  const trackError = (error: string, errorInfo?: any) => {
    trackEvent('error', {
      error,
      errorInfo,
      page: pathname,
    });
  };

  return {
    trackEvent,
    trackProjectView,
    trackDownload,
    trackExternalLink,
    trackFormSubmission,
    trackScrollDepth,
    trackTimeOnPage,
    trackError,
  };
};

// Higher-order component for automatic analytics tracking
export function withAnalytics<T extends object>(Component: React.ComponentType<T>) {
  return (props: T) => {
    useAnalytics();
    return React.createElement(Component, props);
  };
}

// Hook for scroll depth tracking
export const useScrollTracking = () => {
  const { trackScrollDepth } = useAnalytics();

  useEffect(() => {
    let maxScrollDepth = 0;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

        if (scrollPercentage > maxScrollDepth && scrollPercentage % 25 === 0) {
          maxScrollDepth = scrollPercentage;
          trackScrollDepth(scrollPercentage);
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [trackScrollDepth]);
};

// Hook for time on page tracking
export const useTimeTracking = () => {
  const { trackTimeOnPage } = useAnalytics();

  useEffect(() => {
    const startTime = Date.now();

    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent > 5) {
        // Only track if user spent more than 5 seconds
        trackTimeOnPage(timeSpent);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Track time when component unmounts
    };
  }, [trackTimeOnPage]);
};
