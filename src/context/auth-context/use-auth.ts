import { useContext } from 'react';
import { authContext } from './auth-value';

export const useAuth = () => useContext(authContext);
