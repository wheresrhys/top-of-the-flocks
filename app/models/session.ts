import type { EncounterRow, BirdRow, SpeciesRow } from './db';

export type SessionEncounter = EncounterRow & {
	bird: BirdRow & {
		species: SpeciesRow;
	};
};
