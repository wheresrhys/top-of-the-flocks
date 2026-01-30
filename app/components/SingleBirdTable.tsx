import type { Encounter } from '@/app/(routes)/bird/[ring]/page';

export function SingleBirdTable({
	encounters,
	size
}: {
	encounters: Encounter[];
	size?: string;
}) {
	return (
		<div className="overflow-x-auto">
			<table className={`table table-${size}`}>
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
			</table>
		</div>
	);
}
