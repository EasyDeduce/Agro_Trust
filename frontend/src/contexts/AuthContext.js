import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useWeb3 } from './Web3Context';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { account } = useWeb3();

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Login with username and password
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;

      setToken(token);
      setUser(user);

      localStorage.setItem('token', token);
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;

      setToken(token);
      setUser(user);

      localStorage.setItem('token', token);
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify wallet address
  const verifyWallet = async (walletAddress) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/auth/verify-wallet', { walletAddress });
      const { token, user } = response.data;

      setToken(token);
      setUser(user);

      localStorage.setItem('token', token);
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Wallet verification failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Delete account
  const deleteAccount = async (walletAddress) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.delete('/auth/delete', {
        data: { walletAddress }
      });

      // Logout after successful deletion
      logout();
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Account deletion failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get user profile
  const getUserProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Load user data on initial render if token exists
  useEffect(() => {
    if (token) {
      getUserProfile();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Try to auto-connect with wallet if account is available
  useEffect(() => {
    const autoConnectWallet = async () => {
      if (account && !user) {
        try {
          await verifyWallet(account);
        } catch (error) {
          console.log('Wallet not registered or other error');
        }
      }
    };

    if (account) {
      autoConnectWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, user]);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    verifyWallet,
    logout,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};