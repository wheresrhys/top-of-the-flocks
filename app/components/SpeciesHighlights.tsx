'use client';
import { BoxyList } from '@/app/components/DesignSystem';
import { useState } from 'react';
import Link from 'next/link';
import { format as formatDate } from 'date-fns';
import type { PageData } from '@/app/(routes)/species/[speciesName]/page';
import {
	orderBirdsByRecency,
	type EnrichedBirdWithEncounters
} from '@/app/lib/bird-data-helpers';
import { StatOutput } from './StatOutput';

function MostCaughtBird({
	ring,
	allBirds
}: {
	ring: string;
	allBirds: EnrichedBirdWithEncounters[];
}) {
	const bird = allBirds.find(
		(bird) => bird.ring_no === ring
	) as EnrichedBirdWithEncounters;

	return (
		<li className="mb-2">
			<Link className="link" href={`/bird/${bird.ring_no}`}>
				{bird.ring_no}
			</Link>
			: {bird.encounters.length} encounters,{' '}
			<span>
				{formatDate(
					new Date(bird.encounters[0].session.visit_date as string),
					'dd MMMM, yyyy'
				)}{' '}
				-{' '}
				{formatDate(
					new Date(
						bird.encounters[bird.encounters.length - 1].session
							.visit_date as string
					),
					'dd MMMM, yyyy'
				)}
				, proven age: {bird.provenAge} years
			</span>
		</li>
	);
}

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
	mostCaughtBirds
}: PageData) {
	const [expandedId, setExpanded] = useState(false as string | false);
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
			<li>{birds.length} individuals</li>
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
			{mostCaughtBirds?.length > 0 ? (
				<li className="flex items-center gap-2 flex-wrap">
					<span className="text-nowrap">
						Most caught bird{mostCaughtBirds.length > 1 ? 's' : ''}:{' '}
						{mostCaughtBirds[0].encounters} encounters
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
