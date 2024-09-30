import * as React from 'react';
import { styled } from 'constants/theme';

const Muted = styled.span`
	opacity: 0.5;
`;

interface IProps {
	originalString: string;
	searchString?: string;
}

/**
 * Generates the text with a highlighted search string.
 */
const textHighlighter: React.StatelessComponent<IProps> = ({
	originalString,
	searchString,
}) => {
	if (!searchString || searchString.length < 2) {
		return <span>{originalString}</span>;
	}
	const splitStr = originalString.split(searchString);
	if (splitStr.length === 1) {
		return <Muted>{originalString}</Muted>;
	}
	const results = splitStr
		.reduce(
			(acc, strPart, index) =>
				index !== splitStr.length - 1
					? acc.concat([strPart, searchString])
					: acc.concat(strPart),
			[] as string[],
		)
		.filter((_) => !!_);

	return (
		<span>
			{results.map((result, index) =>
				result === searchString ? (
					<span key={`${result}-${index}`}>{result}</span>
				) : (
					<Muted key={`${result}-${index}`}>{result}</Muted>
				),
			)}
		</span>
	);
};

export default textHighlighter;
