import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {api} from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        // Verify token with server
        const response = await api.get('/auth/verify', {
          headers: {Authorization: `Bearer ${storedToken}`}
        });
        
        if (response.data.valid) {
          setToken(storedToken);
          setUser(response.data.user);
          setIsAuthenticated(true);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } else {
          await AsyncStorage.removeItem('auth_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      const {token: authToken, user: userData} = response.data;
      
      await AsyncStorage.setItem('auth_token', authToken);
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return {success: true};
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (username, password) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        password,
      });

      const {token: authToken, user: userData} = response.data;
      
      await AsyncStorage.setItem('auth_token', authToken);
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return {success: true};
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      // Remove authorization header
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
