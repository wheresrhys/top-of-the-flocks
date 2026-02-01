'use client';
import { AccordionItem } from '@/app/components/Accordion';
import { BoxyList } from '@/app/components/DesignSystem';
import { useState } from 'react';
import Link from 'next/link';
import { format as formatDate } from 'date-fns';
import type { PageData } from '@/app/(routes)/species/[speciesName]/page';
import { type EnrichedBirdWithEncounters } from '@/app/(routes)/bird/[ring]/page';
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

export function SpeciesHighlightStats({
	topSessions,
	birds,
	mostCaughtBirds
}: PageData) {
	const [expandedId, setExpanded] = useState(false as string | false);
	const oldestBirdAge = Math.max(...birds.map((bird) => bird.provenAge));
	const oldestBirds =
		oldestBirdAge > 1
			? birds.filter((bird) => bird.provenAge === oldestBirdAge)
			: [];
	return (
		<BoxyList>
			<li>{birds.length} individuals</li>
			<li className="flex items-center gap-2 flex-wrap">
				<span className="text-nowrap">
					Oldest proven age: {oldestBirdAge} years old:
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

			{mostCaughtBirds?.length > 0 ? (
				<AccordionItem
					key="most-caught-birds"
					id="most-caught-birds"
					HeadingComponent={() => <span>Most caught birds:</span>}
					ContentComponent={() => (
						<ol className="list-inside list-none">
							{mostCaughtBirds.map((bird) => (
								<MostCaughtBird
									key={bird.ring_no}
									ring={bird.ring_no}
									allBirds={birds}
								/>
							))}
						</ol>
					)}
					model={{}}
					onToggle={setExpanded}
					expandedId={expandedId}
				/>
			) : null}
			<AccordionItem
				key="top-sessions"
				id="top-sessions"
				HeadingComponent={() => <span>Top 5 sessions by encounters:</span>}
				ContentComponent={() => (
					<ol className="list-inside list-none">
						{topSessions.map((session) => (
							<li className="mb-2" key={session.visit_date}>
								{session.metric_value} on{' '}
								<Link className="link" href={`/session/${session.visit_date}`}>
									{formatDate(
										new Date(session.visit_date as string),
										'dd MMMM, yyyy'
									)}
								</Link>
							</li>
						))}
					</ol>
				)}
				model={{}}
				onToggle={setExpanded}
				expandedId={expandedId}
			/>
		</BoxyList>
	);
}
