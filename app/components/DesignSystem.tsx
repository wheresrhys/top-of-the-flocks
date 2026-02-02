export function PageWrapper({ children }: { children: React.ReactNode }) {
	return <div className="m-3">{children}</div>;
}
export function PrimaryHeading({ children }: { children: React.ReactNode }) {
	return <h1 className="text-base-content text-3xl mt-4 mb-4">{children}</h1>;
}
export function SecondaryHeading({ children }: { children: React.ReactNode }) {
	return <h2 className="text-base-content text-2xl mt-3 mb-3">{children}</h2>;
}
export function BoxyList({ children }: { children: React.ReactNode }) {
	return (
		<ul className="border-base-content/25 divide-base-content/25 divide-y rounded-md border *:p-3 *:first:rounded-t-md *:last:rounded-b-md">
			{children}
		</ul>
	);
}

export function Table({ children }: { children: React.ReactNode }) {
	return (
		<div className="w-full overflow-x-auto mt-4">
			<table className="table">{children}</table>
		</div>
	);
}

export function InlineTable({ children }: { children: React.ReactNode }) {
	return <table className="table table-xs">{children}</table>;
}
