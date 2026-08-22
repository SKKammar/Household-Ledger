export function nowIST(): string {
	return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).replace(' ', 'T');
}

export function todayIST(): string {
	return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' });
}

export function currentMonthIST(): { year: number; month: number } {
	const d = new Date(nowIST());
	return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function isCurrentMonthIST(dateStr: string): boolean {
	const { year, month } = currentMonthIST();
	const [y, m] = dateStr.split('-').map(Number);
	return y === year && m === month;
}

export function formatDateIST(dateStr: string): string {
	const [, m, d] = dateStr.split('-');
	const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	return `${d} ${months[parseInt(m) - 1]}`;
}
