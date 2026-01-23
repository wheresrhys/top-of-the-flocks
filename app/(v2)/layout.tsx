import GlobalNav from './components/GlobalNav';

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log('V2 layout');
  return (
    <>
      <GlobalNav />
      {children}
    </>
  );
}
