import React from 'react';
import { motion } from 'framer-motion';

export function LoadingScreen() {
  const gems = ['💎', '💍', '🔮', '⭐', '✨'];
  
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <motion.div
          className="loading-logo"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        >
          <div className="logo-gems">
            {gems.map((gem, index) => (
              <motion.span
                key={index}
                className="gem"
                initial={{ y: 0, opacity: 0.7 }}
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.7, 1, 0.7],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 2,
                  delay: index * 0.2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                {gem}
              </motion.span>
            ))}
          </div>
        </motion.div>
        
        <motion.h1
          className="loading-title"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Match-3 Galaxy
        </motion.h1>
        
        <motion.div
          className="loading-spinner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="spinner">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="spinner-dot"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        </motion.div>
        
        <motion.p
          className="loading-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Preparing your cosmic adventure...
        </motion.p>
      </div>
      
      {/* Fixed: Use style tag without jsx attribute */}
      <style>{`
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            var(--tg-theme-bg-color, #1a1a2e) 0%,
            var(--tg-theme-secondary-bg-color, #16213e) 50%,
            var(--tg-theme-bg-color, #0f3460) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        .loading-content {
          text-align: center;
          color: var(--tg-theme-text-color, #ffffff);
          max-width: 300px;
          padding: 20px;
        }
        
        .loading-logo {
          margin-bottom: 30px;
        }
        
        .logo-gems {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        
        .gem {
          font-size: 28px;
          display: inline-block;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
        }
        
        .loading-title {
          font-size: 28px;
          font-weight: bold;
          margin: 0 0 30px 0;
          background: linear-gradient(
            45deg,
            var(--tg-theme-link-color, #4fc3f7),
            var(--tg-theme-button-color, #9c27b0),
            var(--tg-theme-link-color, #f06292)
          );
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient 3s ease infinite;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .loading-spinner {
          margin: 30px 0;
        }
        
        .spinner {
          display: flex;
          justify-content: center;
          gap: 4px;
        }
        
        .spinner-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--tg-theme-button-color, #4fc3f7);
          box-shadow: 0 0 6px var(--tg-theme-button-color, #4fc3f7);
        }
        
        .loading-text {
          font-size: 14px;
          margin: 20px 0 0 0;
          color: var(--tg-theme-hint-color, rgba(255, 255, 255, 0.7));
          font-weight: 300;
        }
        
        @media (max-width: 480px) {
          .loading-title {
            font-size: 24px;
          }
          
          .gem {
            font-size: 24px;
          }
          
          .loading-content {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
}