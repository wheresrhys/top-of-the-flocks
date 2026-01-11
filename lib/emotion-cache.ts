import createCache from '@emotion/cache';

// Create Emotion cache for MUI
// This ensures consistent style injection between server and client
export default function createEmotionCache() {
	return createCache({ key: 'mui-style', prepend: true });
}
