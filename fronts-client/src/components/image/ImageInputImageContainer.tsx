import { styled } from 'constants/theme';

const PORTRAIT_RATIO = 5 / 4;
const NORMAL_PORTRAIT_WIDTH = 160;
const SMALL_PORTRAIT_WIDTH = 60;
const TEXTINPUT_HEIGHT = 30;

const smallPortaitStyle = `
  width: ${SMALL_PORTRAIT_WIDTH}px;
  height: ${Math.floor(SMALL_PORTRAIT_WIDTH * PORTRAIT_RATIO)}px;
  padding: 40% 0;
  min-width: 50px;
  margin: 0 auto;
`;

const normalPortraitStyle = `
  width: ${NORMAL_PORTRAIT_WIDTH}px;
  height: ${Math.floor(
		NORMAL_PORTRAIT_WIDTH * PORTRAIT_RATIO + TEXTINPUT_HEIGHT,
	)}px;
  `;

const smallLandscapeStyle = `
  width: 100%;
  maxWidth: 180px;
  height: 0;
  padding: 40%;
  minWidth: 50px;
`;

const normalLandscapeStyle = `
  width: 100%;
  maxWidth: 180px;
  height: 115px;
  border-color: red;
  border-solid: 1px;
`;

const smallLandscape54Style = `
  width: 100%;
  maxWidth: 180px;
  padding: 40%;
  minWidth: 50px;
`;

const normalLandscape54Style = `
  width: 100%;
  maxWidth: 180px;
`;

const squareStyle = `
  width: ${NORMAL_PORTRAIT_WIDTH}px;
  height: ${Math.floor(NORMAL_PORTRAIT_WIDTH + TEXTINPUT_HEIGHT)}px;
  `;

const getVariableImageContainerStyle = ({
	portrait = false,
	small = false,
	shouldShowLandscape54: shouldShowLandscape54 = false,
	showSquare = false,
}: {
	small?: boolean;
	portrait?: boolean;
	shouldShowLandscape54?: boolean;
	showSquare?: boolean;
}) => {
	switch (true) {
		case showSquare:
			return squareStyle;
		case portrait:
			return small ? smallPortaitStyle : normalPortraitStyle;
		case shouldShowLandscape54:
			return small ? smallLandscape54Style : normalLandscape54Style;
		default:
			return small ? smallLandscapeStyle : normalLandscapeStyle;
	}
};

// assuming any portrait image (ie height>width)
// is in the 4:5 ratio for purposes of styling
// the image container
export const ImageInputImageContainer = styled.div<{
	small?: boolean;
	portrait?: boolean;
	shouldShowLandscape54?: boolean;
	showSquare?: boolean;
}>`
	display: flex;
	flex-direction: column;
	position: relative;
	transition: background-color 0.15s;
	max-width: 100%;
	${getVariableImageContainerStyle}
`;
