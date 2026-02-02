import type { Database } from '@/types/supabase.types';

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
};

export function addProvenAgeToBirds(
	birds: BirdWithEncounters[]
): EnrichedBirdWithEncounters[] {
	return birds.map(addProvenAgeToBird);
}

export function orderBirdsByRecency<
	T extends BirdWithEncounters | EnrichedBirdWithEncounters
>(birds: T[], direction: 'asc' | 'desc', type: 'first' | 'last'): T[] {
	return birds.sort((a, b) => {
		// note that to avoid confusion, encounters are always sorted from first to last, so that the most recent encounter is the last one
		a.encounters = orderEncountersByRecency(a.encounters, 'asc');
		b.encounters = orderEncountersByRecency(b.encounters, 'asc');
		return pairwiseSortEncounters(direction)(
			a.encounters[type === 'first' ? 0 : a.encounters.length - 1],
			b.encounters[type === 'first' ? 0 : b.encounters.length - 1]
		);
	});
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
