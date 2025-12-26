'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/src/lib/auth';

type LoginFormProps = {
  redirectAfter?: string;
};

export default function LoginForm({ redirectAfter = '/' }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!identifier || !password) {
      setError('Пожалуйста, заполните все поля');
      setIsLoading(false);
      return;
    }

    try {
      await login({ identifier, password });

      // Перенаправление после успешного входа
      router.push(redirectAfter);
      router.refresh(); // Обновляем страницу, чтобы подтянуть состояние авторизации
    } catch (err) {
      setError('Ошибка входа. Проверьте email или пароль.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">Вход</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Email
          </label>
          <input
            id="identifier"
            type="email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="mt-1 p-3 w-full border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Пароль
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 p-3 w-full border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors duration-300 font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-6">
        Нет аккаунта?{' '}
        <Link href="/register" className="text-blue-400 hover:underline">
          Зарегистрируйтесь
        </Link>
      </p>
    </div>
  );
}
