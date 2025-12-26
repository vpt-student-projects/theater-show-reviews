'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link href="/" className="text-xl font-bold">
          Афиша
        </Link>
        <nav>
          <Link href="/afisha" className="mr-4">
            Расписание
          </Link>
          <Link href="/plays" className="mr-4">
            Спектакли
          </Link>
          <Link href="/news" className="mr-4">
            Новости
          </Link>
          {user ? (
            <>
              <Link href={`/profile/${user.id}`} className="mr-4">
                Профиль ({user.username})
              </Link>
              <Link href="/logout" className="mr-4">
                Выйти
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="mr-4">
                Войти
              </Link>
              <Link href="/register">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;