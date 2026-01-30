import { BootstrapPageData } from '@/app/components/BootstrapPageData';
import { supabase, catchSupabaseErrors } from '@/lib/supabase';
import type { Database } from '@/types/supabase.types';

type PageParams = { ring: string };
type PageProps = { params: Promise<PageParams> };
type PageData = EnrichedBirdWithEncounters | null;

export type Encounter = Database['public']['Tables']['Encounters']['Row'] & {
	session: Database['public']['Tables']['Sessions']['Row'];
};

export type BirdWithEncounters =
	Database['public']['Tables']['Birds']['Row'] & {
		encounters: Encounter[];
	};

export type EnrichedBirdWithEncounters = BirdWithEncounters & {
	provenAge: number;
};

async function fetchBirdData({ ring }: PageParams) {
	const data = (await supabase
		.from('Birds')
		.select(
			`
			id,
			ring_no,
			encounters:Encounters (
				id,
				age_code,
				capture_time,
				minimum_years,
				record_type,
				sex,
				weight,
				wing_length,
				session:Sessions(
					visit_date
				)
		)
	`
		)
		.eq('ring_no', ring)
		.maybeSingle()
		.then(catchSupabaseErrors)) as PageData;

	if (!data) {
		return null;
	}

	data.encounters = orderEncountersByRecency(data.encounters, 'asc');
	addProvenAgeToBird(data);
	return data as EnrichedBirdWithEncounters;
}

export function pairwiseSortEncounters(
	direction: 'asc' | 'desc'
): (a: Encounter, b: Encounter) => -1 | 0 | 1 {
	return (a, b) => {
		const aTime = new Date(a.session.visit_date).getTime();
		const bTime = new Date(b.session.visit_date).getTime();
		if (aTime === bTime) return 0;
		if (direction === 'asc') return aTime > bTime ? 1 : -1;
		else return aTime < bTime ? 1 : -1;
	};
}

export function orderEncountersByRecency(
	encounters: Encounter[],
	direction: 'asc' | 'desc'
) {
	return encounters.sort(pairwiseSortEncounters(direction));
}

export function addProvenAgeToBird(
	bird: BirdWithEncounters
): EnrichedBirdWithEncounters {
	(bird as EnrichedBirdWithEncounters).provenAge =
		bird.encounters[0].minimum_years +
		new Date(
			bird.encounters[bird.encounters.length - 1].session.visit_date
		).getFullYear() -
		new Date(bird.encounters[0].session.visit_date).getFullYear();
	return bird as EnrichedBirdWithEncounters;
}

function BirdSummary({
	params: { ring },
	data: birds
}: {
	params: PageParams;
	data: PageData;
}) {
	return <div>Bird summary</div>;
	// <div>
	//   <div className="m-5">
	//     <h1 className="text-base-content text-4xl">
	//       {speciesName}: all records
	//     </h1>
	//     <ul className="border-base-content/25 divide-base-content/25 w-full divide-y rounded-md border *:p-3 *:first:rounded-t-md *:last:rounded-b-md mb-5 mt-5">
	//       <li>{birds.length} individuals</li>
	//       <li>
	//         Top 5 sessions by encounters:
	//         <ol>
	//           {topSessions.map((session) => (
	//             <li key={session.visit_date}>
	//               {session.metric_value} on{' '}
	//               <Link
	//                 className="link"
	//                 href={`/session/${session.visit_date}`}
	//               >
	//                 {formatDate(
	//                   new Date(session.visit_date as string),
	//                   'DD MMMM, YYYY'
	//                 )}
	//               </Link>
	//             </li>
	//           ))}
	//         </ol>
	//       </li>
	//       <li>
	//         Oldest proven bird:{' '}
	//         {Math.max(...birds.map((bird) => bird.provenAge))} years old
	//       </li>
	//     </ul>
	//   </div>
	//   <SpeciesTable birds={birds} />
	// </div>
	// );
}

export default async function BirdPage(props: PageProps) {
	return (
		<BootstrapPageData<PageData, PageProps, PageParams>
			pageProps={props}
			getCacheKeys={(params: PageParams) => ['bird', params.ring]}
			dataFetcher={fetchBirdData}
			PageComponent={BirdSummary}
		/>
	);
}
