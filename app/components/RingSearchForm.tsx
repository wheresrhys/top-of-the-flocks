'use client';
import { useRouter } from 'next/navigation';
export function RingSearchForm() {
	const router = useRouter();
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const ring = formData.get('ring') as string;
		router.push(`/bird/${ring}`);
	};
	return (
		<form className="flex gap-2" onSubmit={handleSubmit}>
			<input
				className="input input-bordered"
				type="text"
				name="ring"
				placeholder="Search by ring"
			/>
			<button className="btn btn-primary" type="submit">
				Search
			</button>
		</form>
	);
}
