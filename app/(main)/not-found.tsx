import Link from 'next/link';
import {GoArrowLeft} from 'react-icons/go';

export default function NotFound() {
  return (
    <section className='min-h-[calc(100vh-250px)] font-syne flex items-center justify-center px-4'>
      <div className='text-center'>
        <h1 className='text-7xl font-bold  mb-4'>404</h1>
        <h2 className='text-base font-medium text-primary mb-7'>
          Grattis! Du hittade en sida som inte finns (än)
        </h2>

        <Link
          className='text-sm text-primary font-medium underline flex justify-center  items-center gap-1 group tracking-wider mx-auto text-center'
          href='/'
        >
          <GoArrowLeft
            size={18}
            className='group-hover:-translate-x-2 transition-transform duration-300'
          />
          Tillbaka till startsidan
        </Link>
      </div>
    </section>
  );
}
