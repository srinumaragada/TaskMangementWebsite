'use client';
import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/app/lib/firebase";

export default function GoogleButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      router.push('/Pages/dashboard'); 
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-3 px-4 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-70"
    >
      <FcGoogle className="text-lg" />
      {loading ? 'Signing in...' : 'Continue with Google'}
    </button>
  );
}