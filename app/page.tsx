import Image from "next/image";
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Stack, 
  List, 
  ListItem, 
  ListItemText,
  Link as MuiLink,
  useTheme
} from '@mui/material';
import { Launch } from '@mui/icons-material';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          gap: 4,
        }}
      >
        <Box component="main" sx={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <Image
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
            style={{
              filter: 'var(--logo-filter, none)',
            }}
          />
          
          <List sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <ListItem sx={{ flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' } }}>
              <ListItemText
                primary={
                  <Typography variant="body1" component="span">
                    Get started by editing{" "}
                    <Typography 
                      component="code" 
                      sx={{ 
                        bgcolor: 'rgba(0, 0, 0, 0.05)',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontWeight: 600
                      }}
                    >
                      app/page.tsx
                    </Typography>
                    .
                  </Typography>
                }
              />
            </ListItem>
            <ListItem sx={{ flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' } }}>
              <ListItemText
                primary={
                  <Typography variant="body1">
                    Save and see your changes instantly.
                  </Typography>
                }
              />
            </ListItem>
          </List>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Button
              variant="contained"
              startIcon={<Image src="/vercel.svg" alt="Vercel logomark" width={20} height={20} />}
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              component="a"
              size="large"
              sx={{ 
                borderRadius: '50px',
                px: 3,
                py: 1.5,
                minWidth: { xs: '100%', sm: 'auto' }
              }}
            >
              Deploy now
            </Button>
            
            <Button
              variant="outlined"
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              component="a"
              size="large"
              sx={{ 
                borderRadius: '50px',
                px: 3,
                py: 1.5,
                minWidth: { xs: '100%', sm: '158px' }
              }}
            >
              Read our docs
            </Button>
          </Stack>
        </Box>
        
        <Box component="footer" sx={{ mt: 'auto' }}>
          <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="center" alignItems="center">
            <MuiLink
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Image
                aria-hidden
                src="/file.svg"
                alt="File icon"
                width={16}
                height={16}
              />
              Learn
            </MuiLink>
            
            <MuiLink
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Image
                aria-hidden
                src="/window.svg"
                alt="Window icon"
                width={16}
                height={16}
              />
              Examples
            </MuiLink>
            
            <MuiLink
              href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Image
                aria-hidden
                src="/globe.svg"
                alt="Globe icon"
                width={16}
                height={16}
              />
              Go to nextjs.org →
            </MuiLink>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
