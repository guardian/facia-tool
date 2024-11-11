type Entries<T> = Array<
	{
		[K in keyof T]: [K, T[K]];
	}[keyof T]
>;

export const entries = <
	Key extends string,
	Value,
	Obj extends Record<Key, Value>,
>(
	obj: Obj,
): Entries<Obj> => Object.entries(obj) as Entries<Obj>;
