'use client';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import AdbIcon from '@mui/icons-material/Adb';
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
