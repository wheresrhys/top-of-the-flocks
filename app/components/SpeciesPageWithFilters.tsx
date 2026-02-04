'use client';
import { SpeciesTable } from '@/app/components/SingleSpeciesTable';
import type { Database } from '@/types/supabase.types';
import { type TopPeriodsResult } from '@/app/isomorphic/stats-data-tables';
import { type EnrichedBirdWithEncounters } from '@/app/lib/bird-data-helpers';
import { useState } from 'react';
import { PageWrapper, PrimaryHeading } from '@/app/components/DesignSystem';
import { SingleSpeciesStats } from '@/app/components/SingleSpeciesStats';

type SpeciesStatsRow = Database['public']['Views']['SpeciesStats']['Row'];
type PageParams = { speciesName: string };

export type PageData = {
	topSessions: TopPeriodsResult[];
	birds: EnrichedBirdWithEncounters[];
	speciesStats: SpeciesStatsRow;
};

function Switch({
	label,
	id,
	checked,
	onChange
}: {
	label: string;
	id: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<div className="flex items-center gap-1">
			<input
				type="checkbox"
				className="switch"
				id={id}
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
			/>
			<label className="label-text text-base" htmlFor={id}>
				{label}
			</label>
		</div>
	);
}

function BirdFilters({
	retrappedOnly,
	setRetrappedOnly
}: {
	retrappedOnly: boolean;
	setRetrappedOnly: (retrappedOnly: boolean) => void;
}) {
	return (
		<form className="mt-7 flex justify-end">
			<Switch
				label="List retrapped only"
				id="retrapped-only"
				checked={retrappedOnly}
				onChange={setRetrappedOnly}
			/>
		</form>
	);
}

export function SpeciesPageWithFilters({
	params: { speciesName },
	data
}: {
	params: PageParams;
	data: PageData;
}) {
	const [retrappedOnly, setRetrappedOnly] = useState(false);
	const birds = retrappedOnly
		? data.birds.filter((bird) =>
				bird.encounters.some((encounter) => encounter.record_type === 'S')
			)
		: data.birds;
	return (
		<PageWrapper>
			<PrimaryHeading>{speciesName}</PrimaryHeading>
			<SingleSpeciesStats {...data} />
			<BirdFilters
				retrappedOnly={retrappedOnly}
				setRetrappedOnly={setRetrappedOnly}
			/>
			<SpeciesTable birds={birds} />
		</PageWrapper>
	);
}
