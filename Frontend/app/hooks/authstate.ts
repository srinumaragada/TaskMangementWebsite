// hooks/useAuth.ts
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store/store';

export const useAuth = () => {
  const authState = useSelector((state: RootState) => state.Auth);
  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    isLoading: authState.isLoading
  };
};