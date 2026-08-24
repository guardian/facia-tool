import React from 'react';
import FlatUl from 'components/layout/FlatUl';
import styled from 'styled-components';
import { createCardId } from '../../card/Card';

export interface CollectionWarningItem {
	id: string;
	title?: string;
	suffix?: string;
}

interface Props {
	heading: string;
	items: CollectionWarningItem[];
}

const WarningLi = styled.li`
	& + & {
		margin-top: 10px;
	}
`;

const scrollToCard = (id: string) => {
	const element = document.getElementById(createCardId(id));
	if (element) {
		element.scrollIntoView({
			behavior: 'smooth',
			inline: 'start',
			block: 'end',
		});
	}
};

const CollectionWarningList = ({ heading, items }: Props) => (
	<div>
		<strong>{heading}</strong>
		<FlatUl>
			{items.map(({ id, title, suffix }) => (
				<WarningLi key={id}>
					<a href={`#${id}`} onClick={() => scrollToCard(id)}>
						{title || 'No title'}
					</a>
					{suffix}
				</WarningLi>
			))}
		</FlatUl>
	</div>
);

export default CollectionWarningList;
