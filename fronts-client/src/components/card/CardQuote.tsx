import React from 'react';

interface ColouredQuoteProps {
	colour: string;
	width?: string;
	height?: string;
}

const ColouredQuote = ({
	colour,
	width = '8px',
	height = '19px',
}: ColouredQuoteProps) => (
	<svg
		width={width}
		height={height}
		fill={colour}
		viewBox="0 0 35 25"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d="M69.587.9c-1.842 15.556-3.89 31.316-4.708 48.1H37.043c3.07-16.784 8.391-32.544 17.602-48.1h14.942zM32.949.9c-2.047 15.556-4.094 31.316-4.912 48.1H.2C3.066 32.216 8.592 16.456 17.598.9h15.35z" />
	</svg>
);

export default ColouredQuote;
