import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

// Importing these as side effects since they extend videojs
import 'videojs-contrib-ads';
import 'videojs-ima';
import 'videojs-ima/dist/videojs.ima.css';

interface VastPlayerProps {
  vastTagUrl: string;
  onAdComplete: () => void;
  onAdError: (error: any) => void;
}

const VastPlayer: React.FC<VastPlayerProps> = ({ vastTagUrl, onAdComplete, onAdError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Video.js player
    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: true,
      muted: false,
      fluid: true,
      preload: 'auto',
    });

    playerRef.current = player;

    // IMA options
    const options = {
      adTagUrl: vastTagUrl,
      showCountdown: true,
      debug: false,
    };

    // Initialize IMA plugin
    try {
      player.ima(options);

      // On mobile devices, ads must be initialized by a user action.
      // We can use the 'contentresumed' event as a proxy for the user having interacted.
      const startAds = () => {
        player.ima.initializeAdDisplayContainer();
        player.ima.requestAds();
        player.off('play', startAds);
      };

      player.on('play', startAds);

      // IMA events
      player.on('ads-ad-started', () => {
        console.log('Ad started');
      });

      player.on('ads-alladscompleted', () => {
        console.log('All ads completed');
        onAdComplete();
      });

      player.on('ads-error', (event: any) => {
        console.error('Ads error:', event.adsError);
        onAdError(event.adsError);
      });

    } catch (e) {
      console.error('Error initializing IMA:', e);
      onAdError(e);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [vastTagUrl, onAdComplete, onAdError]);

  return (
    <div data-vjs-player>
      <video 
        ref={videoRef} 
        className="video-js vjs-big-play-centered w-full rounded-xl overflow-hidden shadow-2xl" 
        playsInline
      />
    </div>
  );
};

export default VastPlayer;
