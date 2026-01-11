import { Container, Box, Typography } from '@mui/material';
import Top5Tabs from './components/Top5Tabs';
import { getTop5Data, TOP5_TABLE_QUERY } from './components/Top5Table';

export default async function Home() {
	// Fetch the first tab's data server-side
	const initialData = await getTop5Data(TOP5_TABLE_QUERY);
	return (
		<Container maxWidth="xl">
			<Box
				sx={{
					minHeight: '100vh',
					py: 4
				}}
			>
				<Typography
					variant="h1"
					component="h1"
					sx={{
						mb: 4,
						textAlign: 'center'
					}}
				>
					Top of the Flocks
				</Typography>

				<Top5Tabs initialData={initialData} />
			</Box>
		</Container>
	);
}
