import { IStaticMethods } from 'flyonui/flyonui';
import type { HSAccordion } from 'flyonui';

declare global {
	interface Window {
		HSStaticMethods: IStaticMethods;
		HSAccordion: typeof HSAccordion;
	}
}

export {};
