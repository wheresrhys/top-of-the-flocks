import type { Database } from '@/types/supabase.types';

export type TopPeriodsResult =
	Database['public']['Functions']['top_periods_by_metric']['Returns'][number];
export type TopSpeciesResult =
	Database['public']['Functions']['top_species_by_metric']['Returns'][number];

import Link from 'next/link';
import { format as formatDate } from 'date-fns';
export type StatOutputModel = {
	value: number;
	speciesName: string;
	visitDate: string;
	showUnit: boolean;
	unit: string;
	temporalUnit: TemporalUnit;
	dateFormat?: string;
};
export type TemporalUnit = 'day' | 'month' | 'year';
const connectingVerbMap: Record<TemporalUnit, 'in' | 'on'> = {
	day: 'on',
	month: 'in',
	year: 'in'
};

const dateFormatMap: Record<TemporalUnit, string> = {
	day: 'dd MMMM yyyy',
	month: 'MMMM yyyy',
	year: 'yyyy'
};

export function StatOutput({
	dateFormat,
	unit,
	value,
	speciesName,
	visitDate,
	showUnit,
	temporalUnit
}: StatOutputModel) {
	return (
		<>
			<span className="font-bold">
				{value} {speciesName || (showUnit ? ` ${unit}` : '')}
			</span>{' '}
			{connectingVerbMap[temporalUnit as TemporalUnit] as string}{' '}
			{temporalUnit === 'day' ? (
				<Link className="link" href={`/session/${visitDate}`}>
					{formatDate(
						new Date(visitDate as string),
						dateFormat || dateFormatMap[temporalUnit as TemporalUnit]
					)}
				</Link>
			) : (
				formatDate(
					new Date(visitDate as string),
					dateFormat || dateFormatMap[temporalUnit as TemporalUnit]
				)
			)}
		</>
	);
}
