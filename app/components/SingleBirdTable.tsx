import type { Encounter } from '@/app/bird/[ring]/page';

export function SingleBirdTable({ encounters }: { encounters: Encounter[] }) {
	return (
		<table className="table table-xs ">
			<thead>
				<tr>
					<th>Date</th>
					<th>Time</th>
					<th>Type</th>
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
						<td>{encounter.record_type}</td>
						<td>{encounter.age_code}</td>
						<td>{encounter.sex}</td>
						<td>{encounter.wing_length}</td>
						<td>{encounter.weight}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
