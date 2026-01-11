'use client';

import { useServerInsertedHTML } from 'next/navigation';
import { useMemo, useRef } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
	const cache = useMemo(() => {
		const emotionCache = createCache({
			key: 'mui-style',
			prepend: true
		});
		emotionCache.compat = true;
		return emotionCache;
	}, []);

	const insertedRef = useRef<string>('');

	useServerInsertedHTML(() => {
		const names = cache.inserted;
		const styles = Object.values(names).join(' ');
		const dataAttribute = `${cache.key} ${Object.keys(names).join(' ')}`;

		if (!styles || styles.length === 0) {
			return null;
		}

		// Prevent duplicate injections by checking if we've already inserted these styles
		const currentKey = dataAttribute;
		if (insertedRef.current === currentKey) {
			return null;
		}
		insertedRef.current = currentKey;

		return (
			<style
				data-emotion={dataAttribute}
				dangerouslySetInnerHTML={{ __html: styles }}
			/>
		);
	});

	return <CacheProvider value={cache}>{children}</CacheProvider>;
}
