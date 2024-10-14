import React from 'react';

export interface ConditionalComponentProps {
	name: string | string[];
	permittedNames?: string[];
}

/**
 * Accepts a name and an array of renderable names. If the component's
 * name isn't in that list, nothing is rendered. Handy for conditional
 * form fields, but possibly applicable in other scenarios.
 */
const ConditionalComponent: React.StatelessComponent<
	ConditionalComponentProps
> = ({ name, permittedNames, children }): React.ReactElement<any> | null => {
	const names = Array.isArray(name) ? name : [name];
	for (const nameIndex in names) {
		if (!permittedNames || permittedNames.indexOf(names[nameIndex]) !== -1) {
			return children ? <>{children}</> : null;
		}
	}
	return null;
};

export default ConditionalComponent;
