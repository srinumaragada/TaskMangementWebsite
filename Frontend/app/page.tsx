// Home.tsx or HomePage.tsx
"use client";

import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "./redux/store/store";
import { checkAuth } from "./redux/slice/UserSlice";
import CheckAuth from "./components/CheckAuth";
import HomePage from "./components/HomePage";
export default function Home() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.Auth
  );
  console.log(user?.id);
    
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Handle redirection if not authenticated
  useEffect(() => {
    if (isLoading) return; // Wait for loading to finish
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  
  return (
    <div>
      {/* Protected route */}
      <CheckAuth isAuthenticated={isAuthenticated} >
        <HomePage />
      </CheckAuth>

     
    </div>
  );
}
