import type { Metadata } from 'next';
import './globals.css';
import GlobalNav from './components/GlobalNav';
import LoadFlyonUI from './components/LoadFlyonUI';
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
				<GlobalNav />
				{children}
				<LoadFlyonUI />
			</body>
		</html>
	);
}
