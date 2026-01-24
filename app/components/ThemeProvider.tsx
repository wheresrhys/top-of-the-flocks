'use client';

import {
	createTheme,
	ThemeProvider as MUIThemeProvider
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMediaQuery } from '@mui/material';
import {
	ReactNode,
	useState,
	useEffect,
	forwardRef,
	ComponentPropsWithoutRef
} from 'react';
import NextLink from 'next/link';

const LinkBehaviour = forwardRef<
	HTMLAnchorElement,
	ComponentPropsWithoutRef<typeof NextLink>
>(function LinkBehaviour(props, ref) {
	return <NextLink ref={ref} {...props} />;
});

interface ThemeProviderProps {
	children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
	const [mounted, setMounted] = useState(false);
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

	useEffect(() => {
		setMounted(true);
	}, []);
	const themeMode = mounted && prefersDarkMode ? 'dark' : 'light';

	const theme = createTheme({
		palette: {
			mode: themeMode,
			primary: {
				main: '#1976d2'
			},
			secondary: {
				main: '#dc004e'
			}
		},
		typography: {
			fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
			h1: {
				fontSize: '2.5rem',
				fontWeight: 600
			},
			h2: {
				fontSize: '2rem',
				fontWeight: 600
			},
			h3: {
				fontSize: '1.75rem',
				fontWeight: 600
			},
			h4: {
				fontSize: '1.5rem',
				fontWeight: 600
			},
			h5: {
				fontSize: '1.25rem',
				fontWeight: 600
			},
			h6: {
				fontSize: '1rem',
				fontWeight: 600
			}
		},
		components: {
			MuiButton: {
				styleOverrides: {
					root: {
						textTransform: 'none',
						borderRadius: 8
					}
				}
			},
			MuiCard: {
				styleOverrides: {
					root: {
						borderRadius: 12
					}
				}
			},
			MuiLink: {
				defaultProps: {
					component: LinkBehaviour
				}
			},
			MuiButtonBase: {
				defaultProps: {
					LinkComponent: LinkBehaviour
				}
			}
		}
	});

	return (
		<MUIThemeProvider theme={theme}>
			<CssBaseline />
			{children}
		</MUIThemeProvider>
	);
}
