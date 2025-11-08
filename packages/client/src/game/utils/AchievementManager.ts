import { Achievement } from '../../types/game';

/**
 * Achievement Manager - Tracks and manages player achievements
 * Provides gamification elements to enhance player engagement
 */
export class AchievementManager {
  private achievements: Map<string, Achievement> = new Map();
  private unlockedAchievements: Set<string> = new Set();
  private stats = {
    totalMatches: 0,
    totalGames: 0,
    totalScore: 0,
    bestScore: 0,
    longestCombo: 0,
    specialTilesCreated: 0,
    bombsExploded: 0,
    rocketsLaunched: 0,
    rainbowsActivated: 0,
    perfectSwaps: 0,
    colorSwapsTriggered: 0,
    massiveMatches: 0, // 5+ matches
    cascadeChains: 0, // 5+ combo chains
  };

  constructor() {
    this.initializeAchievements();
  }

  private initializeAchievements() {
    const achievementData: Achievement[] = [
      // Beginner Achievements
      {
        id: 'first_match',
        name: 'First Match!',
        description: 'Make your first match',
        icon: '🎯',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        reward: { coins: 10 }
      },
      {
        id: 'getting_started',
        name: 'Getting Started',
        description: 'Score 500 points in a single game',
        icon: '⭐',
        unlocked: false,
        progress: 0,
        maxProgress: 500,
        reward: { coins: 25 }
      },

      // Match Achievements
      {
        id: 'combo_master_3',
        name: 'Combo Novice',
        description: 'Achieve a 3x combo',
        icon: '🔥',
        unlocked: false,
        progress: 0,
        maxProgress: 3,
        reward: { coins: 30 }
      },
      {
        id: 'combo_master_5',
        name: 'Combo Expert',
        description: 'Achieve a 5x combo',
        icon: '💥',
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        reward: { coins: 50 }
      },
      {
        id: 'combo_master_10',
        name: 'Combo Legend',
        description: 'Achieve a 10x combo',
        icon: '⚡',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        reward: { coins: 100 }
      },

      // Special Tile Achievements
      {
        id: 'bomb_creator',
        name: 'Demolition Expert',
        description: 'Create 10 bombs',
        icon: '💣',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        reward: { coins: 40, boosters: ['bomb'] }
      },
      {
        id: 'rocket_master',
        name: 'Rocket Scientist',
        description: 'Create 10 rockets',
        icon: '🚀',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        reward: { coins: 40, boosters: ['rocket'] }
      },
      {
        id: 'rainbow_collector',
        name: 'Rainbow Collector',
        description: 'Create 5 rainbow tiles',
        icon: '🌈',
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        reward: { coins: 75, boosters: ['rainbow'] }
      },

      // Score Achievements
      {
        id: 'high_scorer_1k',
        name: 'Rising Star',
        description: 'Score 1,000 points in a game',
        icon: '✨',
        unlocked: false,
        progress: 0,
        maxProgress: 1000,
        reward: { coins: 50 }
      },
      {
        id: 'high_scorer_5k',
        name: 'Point Master',
        description: 'Score 5,000 points in a game',
        icon: '💫',
        unlocked: false,
        progress: 0,
        maxProgress: 5000,
        reward: { coins: 100 }
      },
      {
        id: 'high_scorer_10k',
        name: 'Score Legend',
        description: 'Score 10,000 points in a game',
        icon: '👑',
        unlocked: false,
        progress: 0,
        maxProgress: 10000,
        reward: { coins: 200 }
      },

      // Special Features
      {
        id: 'color_shifter',
        name: 'Color Shifter',
        description: 'Trigger 3 color swaps in one game',
        icon: '🎨',
        unlocked: false,
        progress: 0,
        maxProgress: 3,
        reward: { coins: 60 }
      },
      {
        id: 'massive_match',
        name: 'Massive Match',
        description: 'Make a match of 6+ tiles',
        icon: '💎',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        reward: { coins: 80 }
      },
      {
        id: 'chain_reaction',
        name: 'Chain Reaction',
        description: 'Create a 7+ cascade chain',
        icon: '⛓️',
        unlocked: false,
        progress: 0,
        maxProgress: 7,
        reward: { coins: 100 }
      },

      // Volume Achievements
      {
        id: 'match_veteran',
        name: 'Match Veteran',
        description: 'Make 100 total matches',
        icon: '🎖️',
        unlocked: false,
        progress: 0,
        maxProgress: 100,
        reward: { coins: 150 }
      },
      {
        id: 'dedicated_player',
        name: 'Dedicated Player',
        description: 'Play 50 games',
        icon: '🏆',
        unlocked: false,
        progress: 0,
        maxProgress: 50,
        reward: { coins: 200, lives: 5 }
      }
    ];

    achievementData.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  /**
   * Update stats and check for achievement unlocks
   */
  public updateStats(type: string, value: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    switch (type) {
      case 'match':
        this.stats.totalMatches += value;
        newlyUnlocked.push(...this.checkAchievement('first_match', 1));
        newlyUnlocked.push(...this.checkAchievement('match_veteran', this.stats.totalMatches));
        break;

      case 'score':
        this.stats.totalScore = value;
        if (value > this.stats.bestScore) {
          this.stats.bestScore = value;
        }
        newlyUnlocked.push(...this.checkAchievement('getting_started', value));
        newlyUnlocked.push(...this.checkAchievement('high_scorer_1k', value));
        newlyUnlocked.push(...this.checkAchievement('high_scorer_5k', value));
        newlyUnlocked.push(...this.checkAchievement('high_scorer_10k', value));
        break;

      case 'combo':
        if (value > this.stats.longestCombo) {
          this.stats.longestCombo = value;
        }
        newlyUnlocked.push(...this.checkAchievement('combo_master_3', value));
        newlyUnlocked.push(...this.checkAchievement('combo_master_5', value));
        newlyUnlocked.push(...this.checkAchievement('combo_master_10', value));
        newlyUnlocked.push(...this.checkAchievement('chain_reaction', value));
        break;

      case 'bomb':
        this.stats.bombsExploded++;
        this.stats.specialTilesCreated++;
        newlyUnlocked.push(...this.checkAchievement('bomb_creator', this.stats.bombsExploded));
        break;

      case 'rocket':
        this.stats.rocketsLaunched++;
        this.stats.specialTilesCreated++;
        newlyUnlocked.push(...this.checkAchievement('rocket_master', this.stats.rocketsLaunched));
        break;

      case 'rainbow':
        this.stats.rainbowsActivated++;
        this.stats.specialTilesCreated++;
        newlyUnlocked.push(...this.checkAchievement('rainbow_collector', this.stats.rainbowsActivated));
        break;

      case 'colorSwap':
        this.stats.colorSwapsTriggered++;
        newlyUnlocked.push(...this.checkAchievement('color_shifter', this.stats.colorSwapsTriggered));
        break;

      case 'massiveMatch':
        this.stats.massiveMatches++;
        newlyUnlocked.push(...this.checkAchievement('massive_match', this.stats.massiveMatches));
        break;

      case 'game':
        this.stats.totalGames++;
        newlyUnlocked.push(...this.checkAchievement('dedicated_player', this.stats.totalGames));
        break;
    }

    return newlyUnlocked;
  }

  /**
   * Check if an achievement should be unlocked
   */
  private checkAchievement(achievementId: string, currentValue: number): Achievement[] {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked || this.unlockedAchievements.has(achievementId)) {
      return [];
    }

    achievement.progress = Math.min(currentValue, achievement.maxProgress || 1);

    if (achievement.progress >= (achievement.maxProgress || 1)) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date();
      this.unlockedAchievements.add(achievementId);
      return [achievement];
    }

    return [];
  }

  /**
   * Get all achievements
   */
  public getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  public getUnlockedAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => a.unlocked);
  }

  /**
   * Get achievement progress
   */
  public getProgress(achievementId: string): number {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || !achievement.maxProgress) return 0;
    return (achievement.progress || 0) / achievement.maxProgress;
  }

  /**
   * Get stats
   */
  public getStats() {
    return { ...this.stats };
  }

  /**
   * Reset game-specific stats (called at game start)
   */
  public resetGameStats() {
    this.stats.colorSwapsTriggered = 0;
    this.stats.totalScore = 0;
  }

  /**
   * Save achievements to localStorage
   */
  public saveToStorage() {
    try {
      const data = {
        achievements: Array.from(this.achievements.values()),
        stats: this.stats,
        unlockedIds: Array.from(this.unlockedAchievements)
      };
      localStorage.setItem('match3_achievements', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save achievements:', error);
    }
  }

  /**
   * Load achievements from localStorage
   */
  public loadFromStorage() {
    try {
      const saved = localStorage.getItem('match3_achievements');
      if (saved) {
        const data = JSON.parse(saved);

        // Restore achievements
        if (data.achievements) {
          data.achievements.forEach((achievement: Achievement) => {
            this.achievements.set(achievement.id, achievement);
            if (achievement.unlocked) {
              this.unlockedAchievements.add(achievement.id);
            }
          });
        }

        // Restore stats
        if (data.stats) {
          this.stats = { ...this.stats, ...data.stats };
        }
      }
    } catch (error) {
      console.warn('Failed to load achievements:', error);
    }
  }
}
