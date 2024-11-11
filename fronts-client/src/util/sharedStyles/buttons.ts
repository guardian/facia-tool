import { styled } from 'constants/theme';

export const SmallRoundButton = styled.button`
	appearance: none;
	display: inline-block;
	vertical-align: middle;
	text-align: center;
	width: 32px;
	height: 32px;
	border: none;
	color: inherit;
	cursor: pointer;
	padding: 0;
	border-radius: 100%;
	transition: background-color 0.15s;

	::before {
		font-size: 1em;
		line-height: 1;
	}

	:focus {
		outline: none;
		font-weight: bold;
	}
`;
