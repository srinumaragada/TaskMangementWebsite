'use client';

import GoogleButton from '@/app/components/GoogleButton';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { FormEvent, useState } from 'react';
import { registerUser } from '../../redux/slice/UserSlice';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/app/redux/store/store';

interface RegisterFormData {
  userName: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    userName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setIsLoading(true);
  setErrors([]);
  setIsSuccess(false);

  // Basic client-side validation
  if (!formData.userName || !formData.email || !formData.password) {
    setErrors(['All fields are required']);
    setIsLoading(false);
    return;
  }

  try {
    const result = await dispatch(registerUser(formData)).unwrap();
    
    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  } catch (error: unknown) {
    let errorMessage = 'Registration failed';
    
    if (typeof error === 'object' && error !== null) {
      // Handle API error response
      if ('message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      // Handle HTTP status codes
      if ('status' in error) {
        if (error.status === 409) {
          errorMessage = 'Email already in use';
        } else if (error.status === 400) {
          errorMessage = 'Invalid registration data';
        }
      }
    }
    
    setErrors([errorMessage]);
   setTimeout(() => {
  window.location.reload();
}, 2000);
  } finally {
    setIsLoading(false);
  }
}
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm">
        {/* Success Alert */}
        {isSuccess && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p>Registration successful! Redirecting to login page...</p>
          </div>
        )}

        {/* Error Alert */}
        {errors.length > 0 && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-orange-500 hover:text-orange-600">
              log in to your existing account
            </Link>
          </p>
        </div>
        
        <div className="mb-6">
          <GoogleButton />
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Form fields remain the same */}
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="userName"
              name="userName"
              type="text"
              value={formData.userName}
              onChange={handleChange}
              autoComplete="name"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Processing...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}