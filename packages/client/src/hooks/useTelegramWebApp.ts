import { useEffect, useState, useCallback } from 'react';
import { 
  miniApp, 
  themeParams, 
  viewport, 
  backButton, 
  mainButton,
  hapticFeedback,
  cloudStorage,
  retrieveLaunchParams
} from '@telegram-apps/sdk';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface WebAppData {
  user: TelegramUser | null;
  startParam: string | null;
  canSendAfter: number | null;
  authDate: Date | null;
  hash: string | null;
}

interface TelegramWebAppHook {
  // User and app data
  webAppData: WebAppData;
  isLoading: boolean;
  isReady: boolean;
  
  // Theme and UI
  theme: {
    backgroundColor: string;
    textColor: string;
    hintColor: string;
    linkColor: string;
    buttonColor: string;
    buttonTextColor: string;
    isDark: boolean;
  };
  
  // Viewport information
  viewportInfo: {
    width: number;
    height: number;
    isExpanded: boolean;
    stableHeight: number;
  };
  
  // Navigation and UI controls
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
  
  // Haptic feedback
  impactFeedback: (style: 'light' | 'medium' | 'heavy') => void;
  notificationFeedback: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
  
  // Cloud storage
  saveToCloud: (key: string, value: string) => Promise<void>;
  loadFromCloud: (key: string) => Promise<string | null>;
  removeFromCloud: (key: string) => Promise<void>;
  
  // Utility functions
  close: () => void;
  expand: () => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  shareToStory: (mediaUrl: string, params?: any) => void;
}

export function useTelegramWebApp(): TelegramWebAppHook {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [webAppData, setWebAppData] = useState<WebAppData>({
    user: null,
    startParam: null,
    canSendAfter: null,
    authDate: null,
    hash: null
  });
  const [theme, setTheme] = useState({
    backgroundColor: '#1a1a2e',
    textColor: '#ffffff',
    hintColor: 'rgba(255, 255, 255, 0.7)',
    linkColor: '#4fc3f7',
    buttonColor: '#9c27b0',
    buttonTextColor: '#ffffff',
    isDark: true
  });
  const [viewportInfo, setViewportInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isExpanded: false,
    stableHeight: window.innerHeight
  });

  // Initialize Telegram Web App
  useEffect(() => {
    const initTelegram = async () => {
      try {
        // Mount essential components
        if (miniApp.mount.isAvailable()) {
          miniApp.mount();
        }

        if (themeParams.mount.isAvailable()) {
          themeParams.mount();
        }

        if (viewport.mount.isAvailable()) {
          viewport.mount();
        }

        if (backButton.mount.isAvailable()) {
          backButton.mount();
        }

        if (mainButton.mount.isAvailable()) {
          mainButton.mount();
        }

        if (hapticFeedback.mount.isAvailable()) {
          hapticFeedback.mount();
        }

        if (cloudStorage.mount.isAvailable()) {
          cloudStorage.mount();
        }

        // Get launch parameters
        const launchParams = retrieveLaunchParams();
        if (launchParams.initData) {
          setWebAppData({
            user: launchParams.initData.user || null,
            startParam: launchParams.startParam || null,
            canSendAfter: launchParams.initData.canSendAfter || null,
            authDate: launchParams.initData.authDate ? new Date(launchParams.initData.authDate * 1000) : null,
            hash: launchParams.initData.hash || null
          });
        }

        // Set up theme
        if (themeParams.mount.isAvailable()) {
          const updateTheme = () => {
            setTheme({
              backgroundColor: themeParams.backgroundColor(),
              textColor: themeParams.textColor(),
              hintColor: themeParams.hintColor(),
              linkColor: themeParams.linkColor(),
              buttonColor: themeParams.buttonColor(),
              buttonTextColor: themeParams.buttonTextColor(),
              isDark: themeParams.backgroundColor().includes('1') || themeParams.backgroundColor().includes('2')
            });
          };

          updateTheme();
          themeParams.on('change', updateTheme);
        }

        // Set up viewport
        if (viewport.mount.isAvailable()) {
          const updateViewport = () => {
            setViewportInfo({
              width: viewport.width(),
              height: viewport.height(),
              isExpanded: viewport.isExpanded(),
              stableHeight: viewport.stableHeight()
            });
          };

          updateViewport();
          viewport.on('change', updateViewport);
          
          // Expand viewport by default
          if (!viewport.isExpanded()) {
            viewport.expand();
          }
        }

        // Mark as ready
        if (miniApp.mount.isAvailable()) {
          miniApp.ready();
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Telegram Web App:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initTelegram();
  }, []);

  // Main button controls
  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (mainButton.mount.isAvailable()) {
      mainButton.setParams({
        text,
        isVisible: true,
        isEnabled: true
      });
      mainButton.on('click', onClick);
    }
  }, []);

  const hideMainButton = useCallback(() => {
    if (mainButton.mount.isAvailable()) {
      mainButton.setParams({ isVisible: false });
      mainButton.off('click');
    }
  }, []);

  // Back button controls
  const showBackButton = useCallback((onClick: () => void) => {
    if (backButton.mount.isAvailable()) {
      backButton.show();
      backButton.on('click', onClick);
    }
  }, []);

  const hideBackButton = useCallback(() => {
    if (backButton.mount.isAvailable()) {
      backButton.hide();
      backButton.off('click');
    }
  }, []);

  // Haptic feedback functions
  const impactFeedback = useCallback((style: 'light' | 'medium' | 'heavy') => {
    if (hapticFeedback.mount.isAvailable()) {
      hapticFeedback.impactOccurred(style);
    }
  }, []);

  const notificationFeedback = useCallback((type: 'error' | 'success' | 'warning') => {
    if (hapticFeedback.mount.isAvailable()) {
      hapticFeedback.notificationOccurred(type);
    }
  }, []);

  const selectionChanged = useCallback(() => {
    if (hapticFeedback.mount.isAvailable()) {
      hapticFeedback.selectionChanged();
    }
  }, []);

  // Cloud storage functions
  const saveToCloud = useCallback(async (key: string, value: string): Promise<void> => {
    if (cloudStorage.mount.isAvailable()) {
      try {
        await cloudStorage.setItem(key, value);
      } catch (error) {
        console.error('Failed to save to cloud storage:', error);
        throw error;
      }
    } else {
      // Fallback to localStorage
      localStorage.setItem(`tg_cloud_${key}`, value);
    }
  }, []);

  const loadFromCloud = useCallback(async (key: string): Promise<string | null> => {
    if (cloudStorage.mount.isAvailable()) {
      try {
        return await cloudStorage.getItem(key);
      } catch (error) {
        console.error('Failed to load from cloud storage:', error);
        return null;
      }
    } else {
      // Fallback to localStorage
      return localStorage.getItem(`tg_cloud_${key}`);
    }
  }, []);

  const removeFromCloud = useCallback(async (key: string): Promise<void> => {
    if (cloudStorage.mount.isAvailable()) {
      try {
        await cloudStorage.removeItem(key);
      } catch (error) {
        console.error('Failed to remove from cloud storage:', error);
        throw error;
      }
    } else {
      // Fallback to localStorage
      localStorage.removeItem(`tg_cloud_${key}`);
    }
  }, []);

  // Utility functions
  const close = useCallback(() => {
    if (miniApp.mount.isAvailable()) {
      miniApp.close();
    }
  }, []);

  const expand = useCallback(() => {
    if (viewport.mount.isAvailable()) {
      viewport.expand();
    }
  }, []);

  const openLink = useCallback((url: string) => {
    if (miniApp.mount.isAvailable()) {
      miniApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }, []);

  const openTelegramLink = useCallback((url: string) => {
    if (miniApp.mount.isAvailable()) {
      miniApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  }, []);

  const shareToStory = useCallback((mediaUrl: string, params: any = {}) => {
    if (miniApp.mount.isAvailable()) {
      miniApp.shareToStory(mediaUrl, params);
    }
  }, []);

  return {
    webAppData,
    isLoading,
    isReady,
    theme,
    viewportInfo,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    impactFeedback,
    notificationFeedback,
    selectionChanged,
    saveToCloud,
    loadFromCloud,
    removeFromCloud,
    close,
    expand,
    openLink,
    openTelegramLink,
    shareToStory
  };
}

export type { TelegramUser, WebAppData, TelegramWebAppHook };