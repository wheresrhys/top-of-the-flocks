import type { Metadata } from 'next';
import './globals.css';
import GlobalNav from './components/layout/GlobalNav';
import LoadFlyonUI from './components/layout/LoadFlyonUI';
import { Suspense } from 'react';
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
				<Suspense>
					<LoadFlyonUI />
				</Suspense>
			</body>
		</html>
	);
}
