import { fetchNewsById } from '../../../lib/strapi';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface NewsPageProps {
  params: {
    id: string;
  };
}

export default async function NewsItemPage({ params }: NewsPageProps) {
  const strapiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:1337';
  
  try {
    const newsResponse = await fetchNewsById(params.id,{
        populate: ['image'],
    });
    
    if (!newsResponse.data) {
      return notFound();
    }

    const imgPath = newsResponse.data.image?.formats.large.url;
    const imageUrl = imgPath ? `${strapiUrl}${imgPath}` : '/placeholder.jpg';

    return (
      <div className="bg-gray-900 text-white min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <Link 
            href="/news" 
            className="inline-block mb-8 text-indigo-400 hover:text-indigo-300 transition-colors duration-300"
          >
            ← Назад к новостям
          </Link>

          <article className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="p-8 lg:w-3/5">
                <h1 className="text-4xl font-bold mb-6">{newsResponse.data.title}</h1>
                
                {newsResponse.data.published_date && (
                  <div className="text-gray-400 mb-6">
                    {new Date(newsResponse.data.published_date).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                )}

                <div className="prose prose-invert max-w-none">
                  {newsResponse.data.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div className="lg:w-2/5 relative">
                <div className="sticky top-0 h-full">
                  <Image
                    src={imageUrl}
                    alt={newsResponse.data.image?.name || `Изображение: ${newsResponse.data.title}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    className="h-full"
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}