'use client';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
const pages = [
	{
		text: 'Stats table',
		path: '/stats'
	}
];

export default function GlobalNav() {
	return (
		<AppBar position="static">
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<Typography
						variant="h6"
						noWrap
						component="a"
						href="/"
						sx={{
							mr: 2,
							display: { xs: 'flex' },
							fontFamily: 'monospace',
							fontWeight: 700,
							letterSpacing: '.3rem',
							color: 'inherit',
							textDecoration: 'none'
						}}
					>
						TOTP
					</Typography>

					<Box sx={{ flexGrow: 1, display: { xs: 'flex' } }}>
						{pages.map((page) => (
							<Typography
								component="a"
								key={page.path}
								href={page.path}
								sx={{
									textAlign: 'center'
								}}
							>
								{page.text}
							</Typography>
						))}
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
}
