// FlyonuiScript.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';


async function loadFlyonUI() {
  return import('flyonui/dist/accordion.js');
}

export default function FlyonuiScript() {
  const path = usePathname();

  useEffect(() => {
    const initFlyonUI = async () => {
      await loadFlyonUI();
    };

    initFlyonUI();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (
        window.HSAccordion &&
        typeof window.HSAccordion.autoInit === 'function'
      ) {
        window.HSAccordion.autoInit();
      }
    }, 100);
  }, [path]);

  return null;
}
