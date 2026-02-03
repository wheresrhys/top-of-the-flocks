import type { Encounter } from '@/app/lib/bird-data-helpers';
import { Table, InlineTable } from './DesignSystem';

export function SingleBirdTable({
	encounters,
	isInline = false
}: {
	encounters: Encounter[];
	isInline?: boolean;
}) {
	const TableComponent = isInline ? InlineTable : Table;
	return (
		<TableComponent testId="single-bird-table">
			<thead>
				<tr>
					<th>Date</th>
					<th>Time</th>
					<th>Age</th>
					<th>Sex</th>
					<th>Wing</th>
					<th>Weight</th>
				</tr>
			</thead>
			<tbody>
				{encounters?.map((encounter) => (
					<tr key={encounter.id}>
						<td>{encounter.session.visit_date}</td>
						<td>{encounter.capture_time}</td>
						<td>
							{encounter.age_code}
							{encounter.is_juv ? 'J' : ''}
						</td>
						<td>{encounter.sex}</td>
						<td>{encounter.wing_length}</td>
						<td>{encounter.weight}</td>
					</tr>
				))}
			</tbody>
		</TableComponent>
	);
}
