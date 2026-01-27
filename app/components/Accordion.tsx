'use client';
import { useState } from 'react';

function AccordionItem<ItemModel>({
	id,
	model,
	onToggle,
	expandedId,
	HeadingComponent,
	ContentComponent
}: {
	id: string;
	model: ItemModel;
	onToggle: (id: string | false) => void;
	expandedId: string | false;
	HeadingComponent: React.ReactNode;
	ContentComponent: React.ReactNode;
}) {
	async function onClick(isAlreadyExpanded: boolean) {
		if (isAlreadyExpanded) {
			onToggle(false);
		} else {
			onToggle(id);
		}
	}

	return (
		<div
			className={`accordion-item ${expandedId === id ? 'active' : ''}`}
			id={id}
		>
			<button
				onClick={(event) => onClick(expandedId === id)}
				className="accordion-toggle inline-flex items-center justify-between text-start"
				aria-controls={`${id}-content`}
				aria-expanded={expandedId === id}
				id={`${id}-header`}
			>
				<HeadingComponent model={model} expandedId={expandedId} />
				<span className="icon-[tabler--chevron-left] accordion-item-active:-rotate-90 size-5 shrink-0 transition-transform duration-300 rtl:-rotate-180"></span>
			</button>
			<div
				id={`${id}-content`}
				className={`accordion-content w-full ${expandedId === id ? '' : 'hidden'} overflow-hidden transition-[height] duration-300`}
				aria-labelledby={`${id}-header`}
				role="region"
			>
				<ContentComponent model={model} expandedId={expandedId} />
			</div>
		</div>
	);
}

export function Accordion<ItemModel>({
	data,
	ContentComponent,
	HeadingComponent,
	getKey,
	onExpand = () => {
		return;
	}
}: {
	data: ItemModel[];
	HeadingComponent: React.ReactNode;
	ContentComponent: React.ReactNode;
	getKey: (item: ItemModel) => string;
}) {
	const [expanded, setExpanded] = useState<string | false>(false);
	return (
		<>
			{data !== null ? (
				<div className="accordion divide-neutral/20 divide-y">
					{data.map((item) => (
						<AccordionItem
							key={getKey(item)}
							id={getKey(item)}
							HeadingComponent={HeadingComponent}
							ContentComponent={ContentComponent}
							model={item}
							onToggle={setExpanded}
							expandedId={expanded}
						/>
					))}
				</div>
			) : (
				<span>No data available</span>
			)}
		</>
	);
}
