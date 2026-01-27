import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';
import {
	fetchSpeciesData,
	type BirdWithRelations
} from '@/app/species/[speciesName]/species';
import {
	SpeciesTable,
	type IndividualBirdHistory
} from '@/app/components/SpeciesTable';

function getIndividualBirds(birds: BirdWithRelations[]): Record<string, IndividualBirdHistory> {

	const map: Record<string, BirdWithRelations[]> = {};
	birds.forEach((bird) => {
		const ring_no = bird.ring_no;
		map[ring_no] = map[ring_no] || [];
		map[ring_no].push(...bird.encounters);
	});
	console.log(map)
	return map;
}

function SpeciesSummary({ speciesName, birds }: { speciesName: string, birds: BirdWithRelations[] }) {
	const individualBirds = getIndividualBirds(birds);
	return (
		<div>
			<div className="m-5">
				<h1 className="text-base-content text-4xl">{speciesName}: all records</h1>
				<ul className="border-base-content/25 divide-base-content/25 w-full divide-y rounded-md border *:p-3 *:first:rounded-t-md *:last:rounded-b-md mb-5 mt-5">
					{/* <li>{session.length} birds</li>
					<li>{speciesBreakdown.length} species</li>
					<li>
						{
							session.filter((encounter) => encounter.record_type === 'N')
								.length
						}{' '}
						new
					</li>
					<li>
						{
							session.filter((encounter) => encounter.record_type === 'S')
								.length
						}{' '}
						retraps
					</li>
					<li>
						{session.filter((encounter) => !encounter.is_juv).length} adults
						[FIX ME!]
					</li>
					<li>
						{session.filter((encounter) => encounter.is_juv).length} juvs [FIX
						ME!]
					</li> */}
				</ul>
			</div>
			<SpeciesTable birds={individualBirds} speciesName={speciesName} />
		</div>
	);
}

// async function fetchSpeciesDataWithCache(speciesName: string) {
// 	return unstable_cache(
// 		async () => fetchSpeciesData(speciesName),
// 		['species', speciesName],
// 		{
// 			revalidate: 3600 * 24 * 7,
// 			tags: ['species', speciesName]
// 		}
// 	)();
// }

async function DisplayInitialData({
	paramsPromise
}: {
	paramsPromise: Promise<{ speciesName: string }>;
}) {
	const { speciesName } = await paramsPromise;
	const initialData = await fetchSpeciesData(speciesName);
	if (!initialData) {
		notFound();
	}
	return <SpeciesSummary birds={initialData} speciesName={speciesName} />;
}

export default async function SpeciesPage({
	params: paramsPromise
}: {
	params: Promise<{ speciesName: string }>;
}) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<DisplayInitialData paramsPromise={paramsPromise} />
		</Suspense>
	);
}
