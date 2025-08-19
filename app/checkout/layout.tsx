export default function CheckoutLayout({children}: {children: React.ReactNode}) {
  return (
    <div className='min-h-[calc(100vh-250px)] w-full flex  '>
      <main className='flex-1 w-full flex-col '>
        {children}
      </main>
    </div>
  );
}
