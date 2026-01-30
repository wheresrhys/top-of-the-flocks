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
		<form onSubmit={handleSubmit}>
			<input type="text" name="ring" placeholder="Search by ring" />
			<button type="submit">Search</button>
		</form>
	);
}
