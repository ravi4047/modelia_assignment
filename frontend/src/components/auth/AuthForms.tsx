// src/components/auth/LoginForm.tsx & SignupForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Check, X } from 'lucide-react';
import { AuthSubmitButton } from './AuthSubmitButton';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { AxiosError } from 'axios';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/studio');
    } catch (err) {
      if(err instanceof AxiosError){
        setError(err.response?.data?.error?.message || 'Login failed');
      }else if(err instanceof Error){
        setError(err.message);
      }else{
        setError('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8"
    >
      <div className="flex flex-col items-center justify-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight font-serif">
          Login
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-light italic">
          Welcome back! Please sign in to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          disabled={isLoading}
        />

        <Input
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          disabled={isLoading}
        />

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <AuthSubmitButton isLoading={isLoading} type="submit">Login</AuthSubmitButton>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </motion.div>
  );
}

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Password validation checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet all requirements');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1000));
      // console.log('Signup successful', { email, password });
      // Replace with: await signup(email, password);
      await signup(email, password);
      navigate('/studio');
    } catch (err) {
      console.error(err);
      if(err instanceof AxiosError){
        setError(err.response?.data?.error?.message || 'Signup failed');
      }else if(err instanceof Error){
        setError(err.message);
      }else{
        setError('Signup failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const RequirementItem = ({ met, text }: {met:boolean, text: string}) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="w-4 h-4 text-green-600 shrink-0" />
      ) : (
        <X className="w-4 h-4 text-gray-400 shrink-0" />
      )}
      <span className={met ? 'text-green-700' : 'text-gray-600'}>{text}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8"
    >
      <div className="flex flex-col items-center justify-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight font-serif">
          Create an account
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-light italic">
          Join us and start your journey!
        </p>
      </div>

      <div className="space-y-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          disabled={isLoading}
        />

        <div>
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            disabled={isLoading}
          />
          
          {(passwordFocused || password) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-1.5"
            >
              <RequirementItem met={passwordChecks.length} text="At least 8 characters" />
              <RequirementItem met={passwordChecks.uppercase} text="One uppercase letter" />
              <RequirementItem met={passwordChecks.lowercase} text="One lowercase letter" />
              <RequirementItem met={passwordChecks.number} text="One number" />
              <RequirementItem met={passwordChecks.special} text="One special character" />
            </motion.div>
          )}
        </div>

        <Input
          type="password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          disabled={isLoading}
        />

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <AuthSubmitButton isLoading={isLoading} type="submit" onClick={handleSubmit}>Sign Up</AuthSubmitButton>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </motion.div>
  );
}