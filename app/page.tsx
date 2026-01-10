'use client';

import { Suspense, useState, SyntheticEvent, ReactNode } from 'react';
import {
	Container,
	Box,
	Typography,
	CircularProgress,
	Tab,
	Tabs
} from '@mui/material';
import Top5Table from './components/Top5Table';
interface TabPanelProps {
	children?: ReactNode;
	index: number;
	value: number;
}

function CustomTabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
}

function a11yProps(index: number) {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`
	};
}

export default function Home() {
	const [value, setValue] = useState(0);

	const handleChange = (event: SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

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

				<Box sx={{ width: { xs: '100%', md: '50%' } }}>
					<Typography
						variant="h3"
						component="h2"
						sx={{
							mb: 4,
							textAlign: 'left'
						}}
					>
						Top 5
					</Typography>

					<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
						<Tabs
							value={value}
							onChange={handleChange}
							aria-label="basic tabs example"
						>
							<Tab label="Sessions" {...a11yProps(0)} />
							<Tab label="Months" {...a11yProps(1)} />
							<Tab label="Years" {...a11yProps(2)} />
						</Tabs>
					</Box>
					<CustomTabPanel value={value} index={0}>
						<Top5Table />
					</CustomTabPanel>
					<CustomTabPanel value={value} index={1}>
						<Top5Table />
					</CustomTabPanel>
					<CustomTabPanel value={value} index={2}>
						<Top5Table />
					</CustomTabPanel>
				</Box>
			</Box>
		</Container>
	);
}
