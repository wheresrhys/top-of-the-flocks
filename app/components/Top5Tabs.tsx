'use client';

import { useState, SyntheticEvent } from 'react';
import { Box, Typography, Tab, Tabs, CircularProgress } from '@mui/material';
import {
	top5TableConfigs,
	Top5TableDisplay,
	type Top5TableData,
	getTop5Data
} from './Top5Table';

interface TabPanelProps {
	children?: React.ReactNode;
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

export default function Top5Tabs({
	initialData
}: {
	initialData: Top5TableData;
}) {
	const [activeTab, setActiveTab] = useState(0);
	const [dataCache, setDataCache] = useState<Record<number, Top5TableData>>({
		0: initialData
	});
	const [loading, setLoading] = useState<Record<number, boolean>>({
		0: false,
		1: false,
		2: false
	});


	const handleChange = async (event: SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);

		// If data is not cached, fetch it
		if (!dataCache[newValue]) {
			setLoading((prev) => ({ ...prev, [newValue]: true }));
			try {
				const data = await getTop5Data(Object.values(top5TableConfigs)[newValue].query);
				setDataCache((prev) => ({ ...prev, [newValue]: data }));
			} catch (error) {
				console.error('Failed to fetch data:', error);
			} finally {
				setLoading((prev) => ({ ...prev, [newValue]: false }));
			}
		}
	};

	return (
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
					value={activeTab}
					onChange={handleChange}
					aria-label="basic tabs example"
				>
					<Tab label="Sessions" {...a11yProps(0)} />
					<Tab label="Months" {...a11yProps(1)} />
					<Tab label="Years" {...a11yProps(2)} />
				</Tabs>
			</Box>
			<CustomTabPanel value={activeTab} index={0}>
				{loading[0] ? (
					<Box display="flex" justifyContent="center" py={4}>
						<CircularProgress />
					</Box>
				) : (
					<Top5TableDisplay temporalUnit="day" data={dataCache[0]} />
				)}
			</CustomTabPanel>
			<CustomTabPanel value={activeTab} index={1}>
				{loading[1] ? (
					<Box display="flex" justifyContent="center" py={4}>
						<CircularProgress />
					</Box>
				) : dataCache[1] ? (
					<Top5TableDisplay temporalUnit="month" data={dataCache[1]} />
				) : null}
			</CustomTabPanel>
			<CustomTabPanel value={activeTab} index={2}>
				{loading[2] ? (
					<Box display="flex" justifyContent="center" py={4}>
						<CircularProgress />
					</Box>
				) : dataCache[2] ? (
					<Top5TableDisplay temporalUnit="year" data={dataCache[2]} />
				) : null}
			</CustomTabPanel>
		</Box>
	);
}
