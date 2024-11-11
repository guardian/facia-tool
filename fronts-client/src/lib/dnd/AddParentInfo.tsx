import React, { createContext } from 'react';

// [type, id]
type Parent = [string, string];

const { Provider: PathProvider, Consumer: PathConsumer } = createContext(
	[] as Parent[],
);

const isMove = (parents1: Parent[], parents2: Parent[]) =>
	parents1 && parents1[0][1] === parents2[0][1];

const isInside = (parents: Parent[], [tc, idc]: Parent) =>
	parents.some(([type, id]) => type === tc && id === idc);

interface Props {
	children: React.ReactNode;
	type: string;
	id: string;
}

const AddParentInfo = ({ children, type, id }: Props) => (
	<PathConsumer>
		{(parents: Parent[] = []) => (
			<PathProvider value={[...parents, [type, id]]}>{children}</PathProvider>
		)}
	</PathConsumer>
);

export { PathProvider, PathConsumer, isMove, isInside, Parent };

export default AddParentInfo;
