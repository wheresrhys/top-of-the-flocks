'use client';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
const pages = [
  // {
  //   text: 'Stats table',
  //   path: '/v1/stats'
  // }
  {
    text: 'v1',
    path: '/v1'
  }
];

export default function GlobalNav() {
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Link
            variant="h6"
            noWrap
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
            TOTF
          </Link>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex' } }}>
            {pages.map((page) => (
              <Link
                key={page.path}
                href={page.path}
                sx={{
                  textAlign: 'center',
                  color: 'inherit'
                }}
              >
                {page.text}
              </Link>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
