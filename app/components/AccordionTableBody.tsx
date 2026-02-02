'use client';
import { useState } from 'react';

type AccordionTableComponent<ItemModel> = React.ComponentType<{
	model: ItemModel;
}>;

type AccordionTableProps<ItemModel> = {
	FirstColumnComponent: AccordionTableComponent<ItemModel>;
	RestColumnsComponent: AccordionTableComponent<ItemModel>;
	ExpandedContentComponent: AccordionTableComponent<ItemModel>;
	data: ItemModel[];
	getKey: (item: ItemModel) => string;
	columnCount: number;
};

// const [birdDetail, setBirdDetail] = useState<Encounter[]>(
//   expandedBird === ring_no ? encounters : []
// );
// function toggleBirdDetail() {
//   if (expandedBird === ring_no) {
//     onExpand(null);
//     setBirdDetail([]);
//   } else {
//     onExpand(ring_no);
//     setBirdDetail(encounters);
//   }
// }

// function ExpandableRowWrapper<ItemModel>({
//   ExpandedContentComponent
//   model
// }: {
//   ExpandedContentComponent: AccordionTableComponent<ItemModel>;
//   model: ItemModel;
// }) {

//   const [expandedData, setExpandedData] = useState<Encounter[]>(
//     expandedBird === ring_no ? encounters : []
//   );
//   function toggleBirdDetail() {
//     if (expandedBird === ring_no) {
//       onExpand(null);
//       setBirdDetail([]);
//     } else {
//       onExpand(ring_no);
//       setBirdDetail(encounters);
//     }
//   }

// }

export function AccordionTableBody<ItemModel>({
	FirstColumnComponent,
	RestColumnsComponent,
	ExpandedContentComponent,
	data,
	getKey,
	columnCount
}: AccordionTableProps<ItemModel>) {
	const [expandedRow, setExpandedRow] = useState<string | false>(false);
	return (
		<tbody>
			{data.map((item: ItemModel) => {
				const rowId = getKey(item);
				return (
					<>
						<tr key={rowId}>
							<td className="flex justify-between">
								<FirstColumnComponent model={item} />
								<button
									type="button"
									className="collapse-toggle btn btn-outline btn-secondary btn-xs btn-square self-end"
									onClick={() =>
										setExpandedRow(expandedRow === rowId ? false : rowId)
									}
								>
									<span className="icon-[tabler--menu-2] collapse-open:hidden size-4"></span>
									<span className="icon-[tabler--x] collapse-open:block hidden size-4"></span>
								</button>
							</td>

							<RestColumnsComponent model={item} />
						</tr>
						{expandedRow === rowId ? (
							<tr>
								<td colSpan={columnCount}>
									<ExpandedContentComponent model={item} />
								</td>
							</tr>
						) : null}
					</>
				);
			})}
		</tbody>
	);
}
