import BookingCalendar from '@/app/components/BookingCalendar';

export const metadata = {
  title: 'Book a Meeting | Jacob Creations',
  description: 'Schedule a consultation to discuss your project needs',
};

export default function BookingPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--dark-bg)' }}>
      <BookingCalendar />
    </main>
  );
}
