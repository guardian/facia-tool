import type { Atom } from '../types/Capi';

export const isAtom = (value: unknown): value is Atom => {
	return (
		typeof value === 'object' &&
		typeof (value as Atom).id === 'string' &&
		typeof (value as Atom).atomType === 'string' &&
		typeof (value as Atom).data === 'object'
	);
};
