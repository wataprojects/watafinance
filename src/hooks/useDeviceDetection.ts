"use client";

import { useState, useEffect } from 'react';

export type DeviceType = 'desktop' | 'android' | 'ios';

export const useDeviceDetection = () => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (/android/.test(userAgent)) {
        setDeviceType('android');
      } else if (/iphone|ipad|ipod/.test(userAgent)) {
        setDeviceType('ios');
      } else {
        // Check if it's a mobile device in general (but not android/ios)
        if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
          setDeviceType('desktop'); // Treat unknown mobile as desktop for simplicity
        } else {
          setDeviceType('desktop');
        }
      }
    };

    detectDevice();
  }, []);

  return deviceType;
};

export const getDownloadConfig = (deviceType: DeviceType) => {
  switch (deviceType) {
    case 'android':
      return {
        label: 'Descargar para Android',
        sublabel: 'Instalar en Android',
        icon: '📱',
      };
    case 'ios':
      return {
        label: 'Descargar para iPhone',
        sublabel: 'Instalar en iPhone',
        icon: '🍎',
      };
    case 'desktop':
    default:
      return {
        label: 'Descargar para Windows',
        sublabel: 'Instalar app',
        icon: '💻',
      };
  }
};