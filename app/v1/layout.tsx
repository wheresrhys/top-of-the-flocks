import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from './components/ThemeProvider';
import EmotionRegistry from '../../lib/emotion-registry';
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
				<EmotionRegistry>
					<ThemeProvider>
						<GlobalNav />
						{children}
					</ThemeProvider>
				</EmotionRegistry>
			</body>
		</html>
	);
}
