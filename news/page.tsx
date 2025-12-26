import { fetchNews } from '../../lib/strapi';
import { News } from '../../types/strapi';
import Link from 'next/link';
import Image from 'next/image';

export default async function NewsPage() {
  const newsResponse = await fetchNews({
    populate: ['image'],
  });

  const newsList = newsResponse.data as News[];
  const strapiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:1337';

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-center mb-12">Все новости</h1>

        {newsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsList.map((item: News) => {
              const imgPath = item.image?.formats.small?.url;
              const imageUrl = imgPath ? `${strapiUrl}${imgPath}` : '/placeholder.jpg';
              return (
                <div key={item.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden group">
                  <Link href={`/news/${item.documentId}`}>
                    <div className="relative h-64 w-full overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={item.image?.name || `Изображение: ${item.title}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-6">
                      <h2 className="text-2xl font-bold mb-3 h-16 overflow-hidden group-hover:text-indigo-400 transition-colors duration-300">
                        {item.title}
                      </h2>
                      <p className="text-gray-400 mb-6 h-28 overflow-hidden">
                        {item.content ? `${item.content.substring(0, 140)}...` : 'Краткое описание отсутствует'}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          {item.published_date ? new Date(item.published_date).toLocaleDateString() : ''}
                        </span>
                        <span className="inline-block bg-indigo-600 group-hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                          Читать
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-400 text-xl">Новостей не найдено.</p>
        )}
      </div>
    </div>
  );
}