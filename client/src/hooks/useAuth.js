import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, logoutUser, clearError, updateUserProfile } from '../features/auth/authSlice';

export const useAuthUser = () => useSelector((state) => state.auth.user);

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, initializing, error } = useSelector((state) => state.auth);

  const login = useCallback((credentials) => dispatch(loginUser(credentials)), [dispatch]);
  const logout = useCallback(() => dispatch(logoutUser()), [dispatch]);
  const clearAuthError = useCallback(() => dispatch(clearError()), [dispatch]);
  const updateProfile = useCallback((data) => dispatch(updateUserProfile(data)), [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    initializing,
    error,
    login,
    logout,
    clearError: clearAuthError,
    updateProfile,
  };
};

export default useAuth;
