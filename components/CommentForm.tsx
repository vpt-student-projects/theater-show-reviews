'use client';

import { useState, useEffect } from 'react';
import StarRating from '@/src/components/StarRating';
import Link from 'next/link';
import { strapi } from '@strapi/client';
import { getAuthToken } from '@/src/lib/auth';
import { User } from '../types/strapi';

interface CommentFormProps {
  playId: string;
}

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';

export default function CommentForm({ playId }: CommentFormProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Проверка авторизации через localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Ошибка парсинга данных пользователя:', e);
        setIsAuthenticated(false);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!content || rating === 0) {
      setError('Пожалуйста, заполните текст отзыва и выберите рейтинг');
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const client = strapi({
        baseURL: STRAPI_BASE_URL,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Создание отзыва через strapi-client
      await client.collection('reviews').create({
          content,
          rating,
          play: playId,
      });

      setSuccess('Отзыв успешно добавлен!');
      setContent('');
      setRating(0);
      // Обновление страницы после добавления отзыва
      window.location.reload();
    } catch (err) {
      setError('Не удалось добавить отзыв. Попробуйте снова.');
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
        <p className="text-gray-300 mb-2">
          Чтобы оставить отзыв, пожалуйста,{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            авторизируйтесь
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Оставить отзыв</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-300 mb-1">
            Рейтинг:
          </label>
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
            Ваш отзыв:
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Напишите ваш отзыв..."
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Отправить отзыв
        </button>
      </form>
    </div>
  );
}