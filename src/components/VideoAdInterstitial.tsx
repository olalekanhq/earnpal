import React, { useEffect, useState, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from '@tanstack/react-router';

// Extend Window interface for IMA SDK
declare global {
  interface Window {
    google: any;
  }
}

const VAST_TAG_URL = import.meta.env['VITE_VAST_AD_TAG_URL'] || 'https://s.magsrv.com/v1/vast.php?idzone=6006924';
const SDK_URL = import.meta.env['VITE_IMA_SDK_URL'] || 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
const AD_DELAY_MS = Number(import.meta.env['VITE_VIDEO_AD_DELAY_MS']) || 3000;

export function VideoAdInterstitial() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  
  const adContainerRef = React.useRef<HTMLDivElement>(null);
  const videoElementRef = React.useRef<HTMLVideoElement>(null);
  const adsLoaderRef = React.useRef<any>(null);
  const adsManagerRef = React.useRef<any>(null);

  const handleClose = useCallback(() => {
    if (adsManagerRef.current) {
      adsManagerRef.current.destroy();
    }
    setIsVisible(false);
    setIsLoading(false);
    
    // Clean up video element to stop any remaining audio
    if (videoElementRef.current) {
      videoElementRef.current.pause();
      videoElementRef.current.src = "";
      videoElementRef.current.load();
    }
  }, []);

  const onAdError = useCallback((adErrorEvent: any) => {
    console.log('VideoAdInterstitial: Ad error, failing silently.', adErrorEvent.getError());
    handleClose();
  }, [handleClose]);

  const onAdEvent = useCallback((adEvent: any) => {
    const type = window.google.ima.AdEvent.Type;
    switch (adEvent.getType()) {
      case type.LOADED:
        setIsLoading(false);
        adsManagerRef.current.start();
        break;
      case type.ALL_ADS_COMPLETED:
      case type.COMPLETE:
      case type.SKIPPED:
        handleClose();
        break;
      default:
        break;
    }
  }, [handleClose]);


  const onAdsManagerLoaded = useCallback((adsManagerLoadedEvent: any) => {
    const adsRenderingSettings = new window.google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

    adsManagerRef.current = adsManagerLoadedEvent.getAdsManager(
      videoElementRef.current,
      adsRenderingSettings
    );

    adsManagerRef.current.addEventListener(
      window.google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError
    );
    adsManagerRef.current.addEventListener(
      window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      onAdEvent
    );
    adsManagerRef.current.addEventListener(
      window.google.ima.AdEvent.Type.LOADED,
      onAdEvent
    );
    adsManagerRef.current.addEventListener(
      window.google.ima.AdEvent.Type.COMPLETE,
      onAdEvent
    );
    adsManagerRef.current.addEventListener(
      window.google.ima.AdEvent.Type.SKIPPED,
      onAdEvent
    );

    try {
      adsManagerRef.current.init(
        window.innerWidth,
        window.innerHeight,
        window.google.ima.ViewMode.FULLSCREEN
      );
      adsManagerRef.current.start();
    } catch (adError) {
      console.error('AdsManager error:', adError);
      handleClose();
    }
  }, [onAdError, onAdEvent, handleClose]);

  const initializeIMA = useCallback(() => {
    if (!window.google || !window.google.ima || !adContainerRef.current || !videoElementRef.current) {
      handleClose();
      return;
    }

    const adDisplayContainer = new window.google.ima.AdDisplayContainer(
      adContainerRef.current,
      videoElementRef.current
    );
    adDisplayContainer.initialize();

    adsLoaderRef.current = new window.google.ima.AdsLoader(adDisplayContainer);
    adsLoaderRef.current.addEventListener(
      window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false
    );
    adsLoaderRef.current.addEventListener(
      window.google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false
    );

    const adsRequest = new window.google.ima.AdsRequest();
    adsRequest.adTagUrl = VAST_TAG_URL;
    adsRequest.linearAdSlotWidth = window.innerWidth;
    adsRequest.linearAdSlotHeight = window.innerHeight;
    adsRequest.nonLinearAdSlotWidth = window.innerWidth;
    adsRequest.nonLinearAdSlotHeight = window.innerHeight;

    adsLoaderRef.current.requestAds(adsRequest);
  }, [onAdError, onAdsManagerLoaded, handleClose]);

  const triggerAd = useCallback(() => {
    setIsVisible(true);
    setIsLoading(true);

    if (!isLoaded) {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      script.onload = () => {
        setIsLoaded(true);
        initializeIMA();
      };
      script.onerror = () => {
        console.log('VideoAdInterstitial: Failed to load IMA SDK');
        handleClose();
      };
      document.head.appendChild(script);
    } else {
      initializeIMA();
    }
  }, [isLoaded, initializeIMA, handleClose]);

  // Trigger ad logic: For now, we trigger it once on mount of a dashboard or earn page
  // as a demonstration of the interstitial.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    
    const checkAdStatus = () => {
      const path = window.location.pathname;
      const shouldTrigger = path.includes('dashboard') || path.includes('earn');
      const hasTriggered = sessionStorage.getItem('interstitial_triggered');
      
      if (shouldTrigger && !hasTriggered) {
        const timer = setTimeout(() => {
          triggerAd();
          sessionStorage.setItem('interstitial_triggered', 'true');
        }, AD_DELAY_MS); 

        return () => clearTimeout(timer);
      }
      return undefined;
    };

    return checkAdStatus();
  }, [location.pathname, triggerAd]);








  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="relative w-full h-full max-w-4xl aspect-video mx-auto flex flex-col items-center justify-center px-4">
        {/* Ad Container */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          <div ref={adContainerRef} className="absolute inset-0 z-10" />
          <video
            ref={videoElementRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-white font-black uppercase tracking-widest text-sm">Preparing Ad...</p>
            </div>
          )}
        </div>

        {/* Branding & Info */}
        <div className="mt-8 text-center space-y-2 animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="bg-primary/20 p-2 rounded-xl">
              <img src="/logo.png" alt="Earn Pal" className="h-6 w-6 object-contain" />
            </div>
            <span className="text-xl font-black text-white uppercase tracking-tighter">Earn Pal</span>
          </div>
          <p className="text-white/60 font-medium max-w-md">
            Your reward is coming right after this short message. Thank you for supporting Earn Pal!
          </p>
        </div>

        {/* Close button (Emergency) */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close Ad"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
