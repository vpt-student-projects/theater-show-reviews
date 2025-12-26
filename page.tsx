import AfishaCalendar from '../components/AfishaCalendar';

export default async function HomePage() {
  const strapiUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:1337';

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <section>
        <AfishaCalendar strapiUrl={strapiUrl} />
      </section>
    </div>
  );
}