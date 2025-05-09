"use client";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store/store';
import { checkAuth } from '../redux/slice/UserSlice';

export default function AuthListener() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Check auth status when component mounts
    dispatch(checkAuth());
    
    // Optional: Set up periodic auth checks
    const interval = setInterval(() => {
      dispatch(checkAuth());
    }, 15 * 60 * 1000); // Every 15 minutes
    
    return () => clearInterval(interval);
  }, [dispatch]);

  return null;
}