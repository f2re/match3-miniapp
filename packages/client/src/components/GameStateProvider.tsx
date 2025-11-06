import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { gameStateService } from '../services/gameStateService';

interface User {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface GameState {
  user: User | null;
  score: number;
  level: number;
  moves: number;
  lives: number;
  coins: number;
  isPlaying: boolean;
  isPaused: false;
  gameMode: 'classic' | 'timed' | 'moves';
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
}

type GameAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'SET_LEVEL'; payload: number }
  | { type: 'SET_MOVES'; payload: number }
  | { type: 'USE_MOVE' }
  | { type: 'SET_LIVES'; payload: number }
  | { type: 'USE_LIFE' }
  | { type: 'ADD_COINS'; payload: number }
  | { type: 'SPEND_COINS'; payload: number }
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'END_GAME' }
  | { type: 'SET_GAME_MODE'; payload: 'classic' | 'timed' | 'moves' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_MUSIC' }
  | { type: 'TOGGLE_VIBRATION' }
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<GameState> };

const initialState: GameState = {
  user: null,
  score: 0,
  level: 1,
  moves: 20,
  lives: 5,
  coins: 100,
  isPlaying: false,
  isPaused: false,
  gameMode: 'classic',
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
};

function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_SCORE':
      return { ...state, score: Math.max(0, state.score + action.payload) };
    case 'SET_LEVEL':
      return { ...state, level: action.payload };
    case 'SET_MOVES':
      return { ...state, moves: action.payload };
    case 'USE_MOVE':
      return { ...state, moves: Math.max(0, state.moves - 1) };
    case 'SET_LIVES':
      return { ...state, lives: action.payload };
    case 'USE_LIFE':
      return { ...state, lives: Math.max(0, state.lives - 1) };
    case 'ADD_COINS':
      return { ...state, coins: state.coins + action.payload };
    case 'SPEND_COINS':
      return { ...state, coins: Math.max(0, state.coins - action.payload) };
    case 'START_GAME':
      return { ...state, isPlaying: true, isPaused: false };
    case 'PAUSE_GAME':
      return { ...state, isPaused: true };
    case 'RESUME_GAME':
      return { ...state, isPaused: false };
    case 'END_GAME':
      return { ...state, isPlaying: false, isPaused: false };
    case 'SET_GAME_MODE':
      return { ...state, gameMode: action.payload };
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };
    case 'TOGGLE_MUSIC':
      return { ...state, musicEnabled: !state.musicEnabled };
    case 'TOGGLE_VIBRATION':
      return { ...state, vibrationEnabled: !state.vibrationEnabled };
    case 'LOAD_SAVED_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const GameStateContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

interface GameStateProviderProps {
  children: ReactNode;
  user?: User | null;
}

export function GameStateProvider({ children, user }: GameStateProviderProps) {
  const [state, dispatch] = useReducer(gameStateReducer, initialState);

  // Set user when provided
  useEffect(() => {
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
    }
  }, [user]);

  // Load saved game state on mount
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        if (state.user?.id) {
          const savedState = await gameStateService.loadGameState(state.user.id);
          if (savedState) {
            dispatch({ type: 'LOAD_SAVED_STATE', payload: savedState });
          }
        }
      } catch (error) {
        console.error('Failed to load saved game state:', error);
      }
    };

    loadSavedState();
  }, [state.user?.id]);

  // Save game state periodically
  useEffect(() => {
    const saveInterval = setInterval(async () => {
      if (state.user?.id) {
        try {
          await gameStateService.saveGameState(state.user.id, {
            score: state.score,
            level: state.level,
            lives: state.lives,
            coins: state.coins,
            soundEnabled: state.soundEnabled,
            musicEnabled: state.musicEnabled,
            vibrationEnabled: state.vibrationEnabled,
          });
        } catch (error) {
          console.error('Failed to save game state:', error);
        }
      }
    }, 10000); // Save every 10 seconds

    return () => clearInterval(saveInterval);
  }, [state]);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}

export type { GameState, GameAction, User };