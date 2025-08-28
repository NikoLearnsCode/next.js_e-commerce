'use server';

import {getNavigationData} from '@/actions/navigation';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import {Toaster} from 'sonner';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = await getNavigationData();
/*   console.log('FÖRSTA - navLinks:', navLinks);
  console.log('ANDRA - navLinks:', navLinks[0]?.subLinks);
  console.log('TREDJE - navLinks:', navLinks[0]?.subSubLinks); */
  return (
    <div className='min-h-[calc(100vh-250px)] w-full flex flex-col'>
      <main className='flex-1 w-full'>
        <Header navLinks={navLinks} />
        {children}
        <Footer />
        <Toaster />
      </main>
    </div>
  );
}
