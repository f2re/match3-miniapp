// hooks/useGameService.ts
import { useState, useEffect } from 'react';
import { User, GameData } from '../../shared/types';
import GameService from '../services/GameService';

export const useGameService = () => {
  const [user, setUser] = useState<User | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (telegramId: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await GameService.getUserByTelegramId(telegramId);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await GameService.createUser(userData);
      if (newUser) {
        setUser(newUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const fetchGameData = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await GameService.getGameDataByUserId(userId);
      setGameData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch game data');
    } finally {
      setLoading(false);
    }
  };

  const saveGameData = async (gameData: Omit<GameData, 'id' | 'lastPlayed'>) => {
    setLoading(true);
    setError(null);
    try {
      const savedData = await GameService.saveGameData(gameData);
      if (savedData) {
        setGameData(savedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save game data');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    gameData,
    loading,
    error,
    fetchUser,
    createUser,
    fetchGameData,
    saveGameData,
  };
};