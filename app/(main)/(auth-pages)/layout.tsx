export default function AuthLayout({children}: {children: React.ReactNode}) {
  return (
    <div className='w-full flex py-12 items-center justify-center px-0  min-h-[calc(100vh-250px)]'>
      {children}
    </div>
  );
}
