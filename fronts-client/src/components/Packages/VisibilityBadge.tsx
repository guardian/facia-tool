import React from 'react';
import { Badge } from '@guardian/stand/Badge';

interface VisibilityBadgeProps {
	isHidden: boolean;
}

export const VisibilityBadge: React.FC<VisibilityBadgeProps> = ({
	isHidden,
}) => {
	return (
		<Badge size="sm" color={isHidden ? 'grey' : 'green'}>
			{isHidden ? 'Hidden' : 'Visible'}
		</Badge>
	);
};
