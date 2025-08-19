'use client';
import Link from 'next/link';

type LogoProps = {
  href?: string;

  width?: number;
  height?: number;
};

function Logo({href = '/', width = 28, height = 36}: LogoProps) {
  return (
    <>
      <Link href={href}>
        <svg
          width={width}
          height={height}
          viewBox='0 0 163 162'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          {/* N */}
          <path d='M57.9205 61.1056L56.605 127.025' className='logo-n-line1' />
          <path d='M145.788 58.0054L146.688 122.958' className='logo-n-line2' />
          <path d='M59.4535 55.276L144.616 128.773' className='logo-n-line3' />

          {/* C */}
          <path
            d='M161.546 23.4141C145.118 11.9443 124.463 5.1123 102.028 5.1123C48.4861 5.1123 5.08165 44.024 5.08165 92.0241C5.08165 140.024 48.4861 178.936 102.028 178.936C124.463 178.936 145.118 172.104 161.546 160.634V141.412C146.856 155.128 125.976 163.936 102.028 163.936C55.1869 163.936 20.0816 130.241 20.0816 92.0241C20.0816 53.8077 55.1869 20.1123 102.028 20.1123C125.976 20.1123 146.856 28.9197 161.546 42.6359V23.4141Z'
            className='logo-c'
          />
        </svg>
      </Link>
    </>
  );
}
export default Logo;
