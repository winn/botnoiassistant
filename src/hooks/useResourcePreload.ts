import { useEffect, useCallback } from 'react';

interface PreloadOptions {
  images?: string[];
  scripts?: string[];
  styles?: string[];
  fonts?: Array<{
    family: string;
    url: string;
    descriptors?: FontFaceDescriptors;
  }>;
}

export function useResourcePreload({
  images = [],
  scripts = [],
  styles = [],
  fonts = []
}: PreloadOptions) {
  const preloadImage = useCallback((src: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadScript = useCallback((src: string) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve(src);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  const preloadStyle = useCallback((href: string) => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve(href);
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }, []);

  const preloadFont = useCallback(async ({ family, url, descriptors = {} }) => {
    const font = new FontFace(family, `url(${url})`, descriptors);
    const loadedFont = await font.load();
    document.fonts.add(loadedFont);
    return family;
  }, []);

  useEffect(() => {
    const preloadResources = async () => {
      try {
        await Promise.all([
          ...images.map(preloadImage),
          ...scripts.map(preloadScript),
          ...styles.map(preloadStyle),
          ...fonts.map(preloadFont)
        ]);
      } catch (error) {
        console.error('Failed to preload resources:', error);
      }
    };

    preloadResources();
  }, [images, scripts, styles, fonts, preloadImage, preloadScript, preloadStyle, preloadFont]);
}