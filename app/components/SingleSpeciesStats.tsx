import { BoxyList } from '@/app/components/layout/DesignSystem';
import Link from 'next/link';
import type { PageData } from '@/app/(routes)/species/[speciesName]/page';
import { StatOutput } from './StatOutput';
import { UnwrappedBadgeList } from './layout/DesignSystem';
import type { SpeciesStatsRow } from '@/app/models/db-types';

type SpeciesStatsColumnConfig = {
	label: string;
	Component?: (value: string | number) => React.ReactNode;
	property: keyof SpeciesStatsRow;
	suffix?: string;
	category?: string;
	prefix?: string;
	invertSort?: boolean;
};

export const speciesStatsColumns: SpeciesStatsColumnConfig[] = [
	{
		label: 'Species',
		property: 'species_name',
		// @ts-expect-error - TODO: fix this
		Component: (speciesName: string) => (
			<Link className="link text-wrap" href={`/species/${speciesName}`}>
				{speciesName}
			</Link>
		),
		invertSort: true
	},
	{
		label: 'Birds',
		property: 'bird_count',
		category: 'Totals',
		suffix: 'birds'
	},
	{
		label: 'Encounters',
		property: 'encounter_count',
		category: 'Totals',
		suffix: 'encounters'
	},
	{
		label: 'Sessions',
		property: 'session_count',
		category: 'Totals',
		suffix: 'sessions'
	},
	{
		label: 'Max per session',
		property: 'max_per_session',
		category: 'Totals',
		prefix: 'max haul:',
		suffix: 'birds'
	},

	{
		label: '% Birds retrapped',
		property: 'pct_retrapped',
		category: 'Recoveries',
		suffix: '% retrapped'
	},
	{
		label: 'Max time span',
		property: 'max_time_span',
		category: 'Recoveries',
		prefix: 'max time span:',
		suffix: 'days'
	},
	{
		label: 'Max proven age',
		property: 'max_proven_age',
		category: 'Recoveries',
		prefix: 'max proven age:',
		suffix: 'years'
	},
	{
		label: 'Most caught bird',
		property: 'max_encountered_bird',
		category: 'Recoveries',
		prefix: 'most seen bird:',
		suffix: 'times'
	},
	{
		label: 'Max weight',
		property: 'max_weight',
		suffix: 'g',
		category: 'Weight',
		prefix: 'max:'
	},
	{
		label: 'Avg weight',
		property: 'avg_weight',
		suffix: 'g',
		category: 'Weight',
		prefix: 'avg:'
	},
	{
		label: 'Min weight',
		property: 'min_weight',
		suffix: 'g',
		category: 'Weight',
		prefix: 'min:'
	},
	{
		label: 'Median weight',
		property: 'median_weight',
		suffix: 'g',
		category: 'Weight',
		prefix: 'median:'
	},
	{
		label: 'Max wing',
		property: 'max_wing',
		suffix: 'mm',
		category: 'Wing',
		prefix: 'max:'
	},
	{
		label: 'Avg wing',
		property: 'avg_wing',
		suffix: 'mm',
		category: 'Wing',
		prefix: 'avg:'
	},
	{
		label: 'Min wing',
		property: 'min_wing',
		suffix: 'mm',
		category: 'Wing',
		prefix: 'min:'
	},
	{
		label: 'Median wing',
		property: 'median_wing',
		suffix: 'mm',
		category: 'Wing',
		prefix: 'median:'
	}
];

const categoryOrder: string[] = [];
const statsByCategory: Record<string, SpeciesStatsColumnConfig[]> =
	speciesStatsColumns.reduce(
		(map, config) => {
			if (!config.category) return map;
			if (!categoryOrder.includes(config.category)) {
				map[config.category] = [];
				categoryOrder.push(config.category);
			}
			map[config.category].push(config);
			return map;
		},
		{} as Record<string, SpeciesStatsColumnConfig[]>
	);

function StatsByCategory({ speciesStats }: { speciesStats: SpeciesStatsRow }) {
	return categoryOrder.map((categoryName) => {
		const subStats = statsByCategory[categoryName];
		return (
			<li className="flex items-center gap-2 flex-wrap" key={categoryName}>
				{categoryName}:{' '}
				<UnwrappedBadgeList
					items={subStats.map(
						(stat) =>
							`${stat.prefix ? `${stat.prefix} ` : ''}${speciesStats[stat.property as keyof SpeciesStatsRow]}${stat.suffix ? ` ${stat.suffix}` : ''}`
					)}
				/>
			</li>
		);
	});
}

export function SingleSpeciesStats({
	topSessions,
	birds,
	speciesStats
}: PageData) {
	if (!speciesStats) return null;
	const mostCaughtBirds =
		speciesStats.max_encountered_bird && speciesStats.max_encountered_bird > 1
			? birds.filter(
					(bird) => bird.encounters.length === speciesStats.max_encountered_bird
				)
			: [];
	const oldestBirds =
		speciesStats.max_proven_age && speciesStats.max_proven_age > 1
			? birds.filter((bird) => bird.provenAge === speciesStats.max_proven_age)
			: [];

	return (
		<BoxyList testId="headline-stats">
			<StatsByCategory speciesStats={speciesStats} />
			{oldestBirds.length ? (
				<li className="flex items-center gap-2 flex-wrap">
					<span className="text-nowrap">
						Oldest birds: {speciesStats.max_proven_age} years old:
					</span>
					{oldestBirds.map((bird) => (
						<Link
							key={bird.ring_no}
							className="badge badge-outline link"
							href={`/bird/${bird.ring_no}`}
						>
							{bird.ring_no}
						</Link>
					))}
				</li>
			) : (
				<li>No notably old birds</li>
			)}
			{/* todo: longest gap between first and last caught */}
			{mostCaughtBirds.length > 0 ? (
				<li className="flex items-center gap-2 flex-wrap">
					<span className="text-nowrap">
						Most caught bird{mostCaughtBirds.length > 1 ? 's' : ''}:{' '}
						{speciesStats.max_encountered_bird} encounters each
					</span>
					{mostCaughtBirds.map((bird) => (
						<Link
							key={bird.ring_no}
							className="badge badge-outline link"
							href={`/bird/${bird.ring_no}`}
						>
							{bird.ring_no}
						</Link>
					))}
				</li>
			) : (
				<li>No birds retrapped</li>
			)}
			<li className="flex items-center gap-2 flex-wrap">
				<span className="text-nowrap">Top sessions:</span>{' '}
				{topSessions.map((session) => (
					<StatOutput
						key={session.visit_date}
						value={session.metric_value}
						visitDate={session.visit_date}
						temporalUnit="day"
						classes="badge badge-outline"
						dateFormat="d MMM yyyy"
					/>
				))}
			</li>
		</BoxyList>
	);
}
