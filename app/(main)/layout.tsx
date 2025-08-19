import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import {Toaster} from 'sonner';
import {Suspense} from 'react';

export default function MainLayout({children}: {children: React.ReactNode}) {
  return (
    <div className='min-h-[calc(100vh-250px)] w-full flex flex-col'>
      <main className='flex-1 w-full'>
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        {children}
        <Footer />
        <Toaster />{' '}
      </main>
    </div>
  );
}
