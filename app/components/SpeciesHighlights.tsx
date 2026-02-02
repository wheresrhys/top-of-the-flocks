import { BoxyList } from '@/app/components/DesignSystem';
import Link from 'next/link';
import { format as formatDate } from 'date-fns';
import type { PageData } from '@/app/(routes)/species/[speciesName]/page';
import {
	orderBirdsByRecency,
	type EnrichedBirdWithEncounters
} from '@/app/lib/bird-data-helpers';
import { StatOutput } from './StatOutput';

function getOldestBirds(
	birds: EnrichedBirdWithEncounters[]
): EnrichedBirdWithEncounters[] {
	const oldestBirdAge = Math.max(...birds.map((bird) => bird.provenAge));
	return oldestBirdAge > 1
		? birds.filter((bird) => bird.provenAge === oldestBirdAge)
		: [];
}

export function SpeciesHighlightStats({
	topSessions,
	birds,
	speciesStats
}: PageData) {
	// TODO fix these actually not really nullable columns
	const mostCaughtBirds =
		speciesStats.unluckiest && speciesStats.unluckiest > 1
			? birds.filter(
					(bird) => bird.encounters.length === speciesStats.unluckiest
				)
			: [];
	const oldestBirds = getOldestBirds(birds);
	const oldestRecentBird = orderBirdsByRecency(
		getOldestBirds(
			birds.filter((bird) =>
				bird.encounters.some(
					(encounter) =>
						new Date(encounter.session.visit_date) >
						new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)
				)
			)
		),
		'desc',
		'last'
	)[0];
	return (
		<BoxyList>
			<li>
				{speciesStats.individuals} individuals, {speciesStats.encounters}{' '}
				encounters, caught at {speciesStats.session_count} sessions
			</li>
			<li>
				Wing: {speciesStats.shortest_winged} - {speciesStats.longest_winged}{' '}
				(avg {speciesStats.average_wing_length?.toFixed(1)})
			</li>
			<li>
				Weight: {speciesStats.lightest} - {speciesStats.heaviest} (avg{' '}
				{speciesStats.average_weight?.toFixed(1)})
			</li>
			{oldestBirds.length ? (
				<li className="flex items-center gap-2 flex-wrap">
					<span className="text-nowrap">
						Oldest birds: {oldestBirds[0].provenAge} years old:
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
			{oldestRecentBird ? (
				<li>
					Oldest recent bird:{' '}
					<Link
						className="badge badge-outline link"
						href={`/bird/${oldestRecentBird.ring_no}`}
					>
						{oldestRecentBird.ring_no}
					</Link>{' '}
					{oldestRecentBird.provenAge} years old, on{' '}
					<Link
						className="link"
						href={`/session/${oldestRecentBird.encounters[oldestRecentBird.encounters.length - 1].session.visit_date}`}
					>
						{formatDate(
							new Date(
								oldestRecentBird.encounters[
									oldestRecentBird.encounters.length - 1
								].session.visit_date
							),
							'dd MMMM, yyyy'
						)}
					</Link>
				</li>
			) : null}
			{/* todo: longest gap between first and last caught */}
			{mostCaughtBirds.length > 0 ? (
				<li className="flex items-center gap-2 flex-wrap">
					<span className="text-nowrap">
						Most caught bird{mostCaughtBirds.length > 1 ? 's' : ''}:{' '}
						{speciesStats.unluckiest} encounters each
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
				<span className="text-nowrap">Top sessions</span>
				{topSessions.map((session) => (
					<StatOutput
						key={session.visit_date}
						value={session.metric_value}
						visitDate={session.visit_date}
						temporalUnit="day"
						unit="birds"
						classes="badge badge-outline"
						dateFormat="d MMM yyyy"
					/>
				))}
			</li>
		</BoxyList>
	);
}
