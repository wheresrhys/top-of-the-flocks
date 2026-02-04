'use client';
import { SpeciesTable } from '@/app/components/SingleSpeciesTable';
import type { Database } from '@/types/supabase.types';
import { type TopPeriodsResult } from '@/app/isomorphic/stats-data-tables';
import {
	getSex,
	Encounter,
	type EnrichedBirdWithEncounters
} from '@/app/lib/bird-data-helpers';
import { useState } from 'react';
import { PageWrapper, PrimaryHeading } from '@/app/components/DesignSystem';
import { SingleSpeciesStats } from '@/app/components/SingleSpeciesStats';
import { ScatterChart } from 'react-chartkick';
import 'chartkick/chart.js';

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

//function to find the median of the given array
function median(arr: number[]): number {
	const mid = Math.floor(arr.length / 2);
	const sortedArr = arr.sort((a, b) => a - b);

	if (arr.length % 2 === 0) {
		return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
	} else {
		return sortedArr[mid];
	}
}

function addNoiseToWingLength(x: number | null) {
	if (!x) return null;
	return x + (Math.random() - 0.5) * 0.3;
}

function getMedian(
	bird: EnrichedBirdWithEncounters,
	property: keyof Encounter
) {
	return median(
		bird.encounters
			.map((encounter) => encounter[property])
			.filter((number): number is number => Boolean(number))
	);
}

function getNoisyMedian(
	bird: EnrichedBirdWithEncounters,
	property: keyof Encounter
) {
	return addNoiseToWingLength(getMedian(bird, property));
}

function getWingWeightXYBird(
	bird: EnrichedBirdWithEncounters
): [number, number] | null {
	const wing = getNoisyMedian(bird, 'wing_length');
	const weight = getMedian(bird, 'weight');

	return wing && weight ? [wing, weight] : null;
}

function isValidPoint(
	arr: [number | null, number | null]
): arr is [number, number] {
	if (arr[0] && arr[1]) {
		return true;
	} else {
		return false;
	}
}

function getWingWeightXYEncounter(
	encounter: Encounter
): [number, number] | null {
	const point = [
		addNoiseToWingLength(encounter.wing_length),
		encounter.weight
	] as [number | null, number | null];
	return isValidPoint(point) ? point : null;
}

type ScatterChartData = {
	name: string;
	data: [number, number][];
};

function getChartData(
	birds: EnrichedBirdWithEncounters[],
	chartGrouping: 'sex' | 'age'
): ScatterChartData[] {
	if (chartGrouping === 'sex') {
		return [
			{
				name: 'F',
				data: birds
					.filter((bird) => getSex(bird.encounters).startsWith('F'))
					.map(getWingWeightXYBird)
					.filter((point) => point !== null)
			},
			{
				name: 'M',
				data: birds
					.filter((bird) => getSex(bird.encounters).startsWith('M'))
					.map(getWingWeightXYBird)
					.filter((point) => point !== null)
			},
			{
				name: 'U',
				data: birds
					.filter((bird) => getSex(bird.encounters).startsWith('U'))
					.map(getWingWeightXYBird)
					.filter((point) => point !== null)
			}
		];
	}
	const allEncounters = birds.flatMap(({ encounters }) => encounters);
	return [
		{
			name: 'Juv',
			data: allEncounters
				.filter((encounter) => encounter.age_code === 3)
				.map(getWingWeightXYEncounter)
				.filter((point) => point !== null)
		},
		{
			name: 'Ad',
			data: allEncounters
				.filter((encounter) => encounter.age_code > 3)
				.map(getWingWeightXYEncounter)
				.filter((point) => point !== null)
		},
		{
			name: 'U',
			data: allEncounters
				.filter((encounter) => encounter.age_code < 3)
				.map(getWingWeightXYEncounter)
				.filter((point) => point !== null)
		}
	];
}

function WeightVsWingLengthChart({
	birds
}: {
	birds: EnrichedBirdWithEncounters[];
}) {
	const [chartGrouping, setChartGrouping] = useState<'sex' | 'age'>('sex');
	const chartData = getChartData(birds, chartGrouping);
	return (
		<>
			<div className="mb-3 flex justify-end">
				<div
					id="toggle-count"
					className="border-base-content/20 flex gap-0.5 rounded-field border p-0.5"
				>
					<label
						htmlFor="toggle-count-monthly"
						className="btn btn-sm btn-text has-checked:btn-active"
					>
						<span>By sex</span>
						<input
							id="toggle-count-monthly"
							name="toggle-count"
							type="radio"
							className="hidden"
							checked={chartGrouping === 'sex'}
							onChange={(event) =>
								setChartGrouping(event.target.checked ? 'sex' : 'age')
							}
						/>
					</label>
					<label
						htmlFor="toggle-count-annual"
						className="btn btn-sm btn-text has-checked:btn-active"
					>
						<span>By age</span>
						<input
							id="toggle-count-annual"
							name="toggle-count"
							type="radio"
							className="hidden"
							checked={chartGrouping === 'age'}
							onChange={(event) =>
								setChartGrouping(event.target.checked ? 'age' : 'sex')
							}
						/>
					</label>
				</div>
			</div>
			<ScatterChart
				min={null}
				data={chartData}
				xtitle="Wing"
				ytitle="Weight"
				colors={['#f88', '#88f', '#bbb']}
				library={{ elements: { point: { radius: 1 } } }}
			/>
		</>
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
			<WeightVsWingLengthChart birds={birds} />
			<BirdFilters
				retrappedOnly={retrappedOnly}
				setRetrappedOnly={setRetrappedOnly}
			/>
			<SpeciesTable birds={birds} />
		</PageWrapper>
	);
}
