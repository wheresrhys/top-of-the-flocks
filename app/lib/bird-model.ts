import type { Database } from '@/types/supabase.types';

type Sex = 'M' | 'F' | 'U';

export type Encounter = Database['public']['Tables']['Encounters']['Row'] & {
	session: Database['public']['Tables']['Sessions']['Row'];
};

export type BirdWithEncounters =
	Database['public']['Tables']['Birds']['Row'] & {
		encounters: Encounter[];
		species?: {
			species_name: string;
		};
	};

export type EnrichedBirdWithEncounters = BirdWithEncounters & {
	provenAge: number;
	sex: Sex;
	sexCertainty: number;
};

export function orderBirdsByRecency<BirdType>(
	birds: EnrichedBirdWithEncounters[] | BirdWithEncounters[],
	{
		direction,
		type,
		encountersAlreadySorted = false
	}: {
		direction: 'asc' | 'desc';
		type: 'first' | 'last';
		encountersAlreadySorted?: boolean;
	}
): BirdType[] {
	return birds.sort((a, b) => {
		const aEncs = encountersAlreadySorted
			? a.encounters
			: orderEncountersByRecency(a.encounters, 'asc');
		const bEncs = encountersAlreadySorted
			? b.encounters
			: orderEncountersByRecency(b.encounters, 'asc');
		// note that to avoid confusion, encounters are always sorted from first to last, so that the most recent encounter is the last one
		return pairwiseSortEncounters(direction)(
			aEncs[type === 'first' ? 0 : aEncs.length - 1],
			bEncs[type === 'first' ? 0 : bEncs.length - 1]
		);
	}) as BirdType[];
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

function getSex(encounters: Encounter[]): [Sex, number] {
	const counts = encounters.reduce(
		(tallies, encounter) => {
			tallies[encounter.sex]++;
			return tallies;
		},
		{ M: 0, F: 0, U: 0 } as Record<string, number>
	);
	if (counts['U'] === encounters.length) {
		return ['U', 1];
	}
	if (counts['M'] === counts['F']) {
		return ['U', 0.5];
	}
	if (counts['M'] > counts['F']) {
		return ['M', counts['M'] / encounters.length];
	} else {
		return ['F', counts['F'] / encounters.length];
	}
}

function getProvenAge(
	encounters: Encounter[],
	isOrdered: boolean = false
): number {
	if (!isOrdered) {
		encounters = orderEncountersByRecency(encounters, 'asc');
	}
	return (
		encounters[0].minimum_years +
		new Date(
			encounters[encounters.length - 1].session.visit_date
		).getFullYear() -
		new Date(encounters[0].session.visit_date).getFullYear()
	);
}

export function enrichBird(
	bird: BirdWithEncounters
): EnrichedBirdWithEncounters {
	const orderedEncounters = orderEncountersByRecency(bird.encounters, 'asc');
	const [sex, sexCertainty] = getSex(orderedEncounters);
	return {
		...bird,
		encounters: orderedEncounters,
		sex,
		sexCertainty,
		provenAge: getProvenAge(orderedEncounters, true)
	};
}
