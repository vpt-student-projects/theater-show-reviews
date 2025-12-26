'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchPerformances } from '../lib/strapi'; // Импортируем fetchPerformances
import { Performance } from '@/src/types/strapi';



interface AfishaCalendarProps {
  strapiUrl: string;
}

export default function AfishaCalendar({ strapiUrl }: AfishaCalendarProps) {
  const [filter, setFilter] = useState(''); // Фильтр по названию (клиент-сайд)
  const [selectedDate, setSelectedDate] = useState(''); // Фильтр по дате (сервер-сайд)
  const [performances, setPerformances] = useState<Performance[]>([]); // Накопленный список
  const [currentPage, setCurrentPage] = useState(1); // Текущая страница
  const [hasMore, setHasMore] = useState(true); // Есть ли ещё данные
  const [loading, setLoading] = useState(false); // Загрузка

  const observerRef = useRef<IntersectionObserver | null>(null); // Для IntersectionObserver

  // Функция для загрузки данных с пагинацией (только фильтр по дате на сервере)
  const loadPerformances = useCallback(async (page: number, reset = false) => {
    setLoading(true);
    try {
      // Фильтры для сервера
      let filters: Record<string, any> = {
        date_time: { $gte: new Date().toISOString() }, // Только будущие даты
      };

      // Добавляем фильтр по выбранной дате, если есть
      if (selectedDate) {
        filters.date_time.$gte = `${selectedDate}T00:00:00Z`; // Начало дня
        filters.date_time.$lte = `${selectedDate}T23:59:59Z`; // Конец дня
      }

      const options = {
        populate: ['play', 'play.poster'], // Подтягиваем спектакль и постер
        sort: 'date_time:asc', // Сортировка по дате ascending
        pagination: { page, pageSize: 10 }, // Пагинация: 10 на страницу
        filters, // Передаём фильтры
      };

      const response = await fetchPerformances(options);

      const newPerformances = response.data.map(perf => ({
        ...perf,
        play: perf.play,
      })) as Performance[];

      // Если reset — очищаем старые, иначе добавляем
      setPerformances(prev => (reset ? newPerformances : [...prev, ...newPerformances]));

      // Проверяем, есть ли ещё данные
      const total = response.meta.pagination.total;
      setHasMore(page * response.meta.pagination.pageSize < total);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]); // Зависимость только от selectedDate, т.к. filter обрабатывается на клиенте

  // Сброс и загрузка при смене даты
  useEffect(() => {
    setPerformances([]); // Очищаем
    setCurrentPage(1);
    setHasMore(true);
    loadPerformances(1, true); // Загружаем первую страницу с reset
  }, [selectedDate, loadPerformances]);

  // Intersection Observer для lazy load
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect(); // Отключаем старый observer

      if (node) {
        const observer = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting && hasMore) {
            setCurrentPage(prev => prev + 1);
            loadPerformances(currentPage + 1); // Загружаем следующую страницу
          }
        });
        observer.observe(node);
        observerRef.current = observer;
      }
    },
    [loading, hasMore, currentPage, loadPerformances]
  );

  // Фильтрация по названию на клиентской стороне
  const filteredPerformances = useMemo(() => {
    if (!filter) return performances; // Если нет фильтра, возвращаем все
    return performances.filter(perf =>
      perf.play.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [performances, filter]);

  // Группировка по датам
  const groupedPerformances = useMemo(() => {
    const groups = filteredPerformances.reduce((acc, performance) => {
      const date = new Date(performance.date_time).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(performance);
      return acc;
    }, {} as Record<string, Performance[]>);

    return Object.entries(groups).sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());
  }, [filteredPerformances]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl lg:text-5xl font-bold text-center mb-8">Афиша</h1>

      <div className="mb-8 max-w-2xl mx-auto flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Фильтр по названию спектакля..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full md:w-auto px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => {
            setFilter('');
            setSelectedDate('');
          }}
          className="w-full md:w-auto px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors"
        >
          Сбросить
        </button>
      </div>

      {loading && !performances.length ? (
        <p className="text-center text-gray-400 text-xl mt-12">Загрузка...</p>
      ) : groupedPerformances.length > 0 ? (
        <div className="space-y-12">
          {groupedPerformances.map(([date, perfs], groupIndex) => (
            <div key={date}>
              <h2 className="text-2xl font-bold text-indigo-400 mb-6 border-b-2 border-gray-700 pb-2">
                {date}
              </h2>
              <div className="space-y-6">
                {perfs.map((perf, perfIndex) => {
                  const posterUrl = perf.play.poster
                    ? `${strapiUrl}${perf.play.poster.formats.thumbnail.url}`
                    : '/placeholder.jpg';
                  // Последний элемент в последней группе получает ref
                  const isLast = groupIndex === groupedPerformances.length - 1 && perfIndex === perfs.length - 1;

                  return (
                    <div ref={isLast ? lastElementRef : null} key={perf.id}>
                      <Link href={`/plays/${perf.play.documentId}`}>
                        <div className="flex flex-col md:flex-row items-center bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors duration-300 shadow-lg">
                          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                            <Image
                              src={posterUrl}
                              alt={perf.play.poster?.alternativeText || `Постер ${perf.play.title}`}
                              width={80}
                              height={120}
                              className="rounded object-cover"
                            />
                          </div>
                          <div className="flex-grow text-center md:text-left">
                            <h3 className="text-xl font-bold">{perf.play.title}</h3>
                            <p className="text-gray-400">
                              {new Date(perf.date_time).toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'UTC',
                              })}
                            </p>
                          </div>
                          <div className="mt-4 md:mt-0">
                            <span className="inline-block bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                              Подробнее
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 text-xl mt-12">Представления по вашему запросу не найдены.</p>
      )}

      {loading && performances.length > 0 && (
        <p className="text-center text-gray-400 mt-8">Загрузка...</p>
      )}
      {!hasMore && performances.length > 0 && (
        <p className="text-center text-gray-400 mt-8">Больше нет представлений.</p>
      )}
    </div>
  );
}