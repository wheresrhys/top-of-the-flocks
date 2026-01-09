import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from './components/ThemeProvider';
import GlobalNav from './components/GlobalNav';

export const metadata: Metadata = {
	title: 'Top of the Flocks',
	description: 'Leaderboard for bird ringing data'
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<ThemeProvider>
					<GlobalNav />
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
