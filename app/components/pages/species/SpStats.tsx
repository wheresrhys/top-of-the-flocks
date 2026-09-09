import {
	BoxyList,
	UnwrappedBadgeList
} from '@/app/components/shared/DesignSystem';
import type { FullFatPageData } from '@/app/(routes)/species/[speciesName]/PageContent';
import type { AggregateStatsResult } from '@/app/models/db';
import type { SpeciesStatConfig } from '@/app/models/species-stats';
import { speciesStatConfigs } from '@/app/models/species-stats';
import type { ViewedGroup } from '@/lib/group-slug';

const categoryOrder: string[] = [];
const statsByCategory: Record<string, SpeciesStatConfig[]> =
	speciesStatConfigs.reduce(
		(map, config) => {
			if (!config.category) return map;
			if (!categoryOrder.includes(config.category)) {
				map[config.category] = [];
				categoryOrder.push(config.category);
			}
			map[config.category].push(config);
			return map;
		},
		{} as Record<string, SpeciesStatConfig[]>
	);

function StatsByCategory({
	speciesStats
}: {
	speciesStats: AggregateStatsResult;
}) {
	return categoryOrder.map((categoryName) => {
		// Weight/Wing have their own dedicated "Biometrics" tab (#783), and
		// Totals (Birds/Encounters/Sessions/Max per session) is now reported
		// by the heading's counts sentence instead (#784) — skip all three
		// here rather than falling through to the generic badge-list
		// rendering below. `categoryOrder`/`statsByCategory` still include
		// these categories since `speciesStatConfigs` (app/models/species-stats.ts)
		// keeps their entries for SppStatsTable.tsx's benefit.
		if (
			categoryName === 'Weight' ||
			categoryName === 'Wing' ||
			categoryName === 'Totals'
		) {
			return null;
		}
		const subStats = statsByCategory[categoryName];
		return (
			<li className="flex items-center gap-2 flex-wrap" key={categoryName}>
				{categoryName}:{' '}
				<UnwrappedBadgeList
					items={subStats.map(
						(stat) =>
							`${stat.prefix ? `${stat.prefix} ` : ''}${speciesStats[stat.property as keyof AggregateStatsResult]}${stat.suffix ? ` ${stat.suffix}` : ''}`
					)}
				/>
			</li>
		);
	});
}

export function SpStats({
	birds,
	speciesStats
}: FullFatPageData & { viewedGroup: ViewedGroup }) {
	if (!speciesStats) return null;
	// const NotableRetrapsBirds =
	// 	speciesStats.max_encountered_bird && speciesStats.max_encountered_bird > 1
	// 		? birds.filter(
	// 				(bird) => bird.encounters.length === speciesStats.max_encountered_bird
	// 			)
	// 		: [];
	// const oldestBirds =
	// 	speciesStats.max_proven_age && speciesStats.max_proven_age > 1
	// 		? birds.filter((bird) => bird.provenAge === speciesStats.max_proven_age)
	// 		: [];

	return (
		<BoxyList testId="headline-stats">
			<StatsByCategory speciesStats={speciesStats} />
			{/* {oldestBirds.length ? (
				<li className="flex items-center gap-2 flex-wrap">
					<span className="text-nowrap">
						Oldest birds: {speciesStats.max_proven_age} years old:
					</span>
					{oldestBirds.map((bird) => (
						<NoPrefetchLink
							key={bird.ring_no}
							className="badge badge-outline link"
							href={`/bird/${bird.ring_no}`}
						>
							{bird.ring_no}
						</NoPrefetchLink>
					))}
				</li>
			) : (
				<li>No notably old birds</li>
			)} */}
			{/* todo: longest gap between first and last caught */}
			{/* {NotableRetrapsBirds.length > 0 ? (
				<li className="flex items-center gap-2 flex-wrap">
					<span className="text-nowrap">
						Most caught bird{NotableRetrapsBirds.length > 1 ? 's' : ''}:{' '}
						{speciesStats.max_encountered_bird} encounters each
					</span>
					{NotableRetrapsBirds.map((bird) => (
						<NoPrefetchLink
							key={bird.ring_no}
							className="badge badge-outline link"
							href={`/bird/${bird.ring_no}`}
						>
							{bird.ring_no}
						</NoPrefetchLink>
					))}
				</li>
			) : (
				<li>No birds retrapped</li>
			)} */}
		</BoxyList>
	);
}
