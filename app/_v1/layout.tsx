import GlobalNav from './components/GlobalNav';

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<GlobalNav />
			{children}
		</>
	);
}
