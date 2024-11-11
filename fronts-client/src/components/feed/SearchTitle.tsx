import { styled } from '../../constants/theme';
import { media } from '../../util/mediaQueries';

export const SearchTitle = styled.h1`
	position: relative;
	margin: 0 10px 0 0;
	padding-top: 2px;
	padding-right: 10px;
	vertical-align: top;
	font-family: TS3TextSans;
	font-weight: bold;
	font-size: 20px;
	min-width: 80px;
	${media.large`
    min-width: 60px;
    font-size: 16px;
  `}
`;
