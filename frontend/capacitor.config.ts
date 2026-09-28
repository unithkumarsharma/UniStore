import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.unistore.app',
  appName: 'UniStore',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // Allows HTTP access to local dev backend during debugging
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#fbf9f5',
      overlaysWebView: false,
    },
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#fbf9f5',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
