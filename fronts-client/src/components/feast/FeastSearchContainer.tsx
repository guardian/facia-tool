import ClipboardHeader from 'components/ClipboardHeader';
import TextInput from 'components/inputs/TextInput';
import ShortVerticalPinline from 'components/layout/ShortVerticalPinline';
import { styled, theme } from 'constants/theme';
import React from 'react';
import { connect } from 'react-redux';
import { media } from 'util/mediaQueries';
import { selectors as recipeSelectors } from 'bundles/recipesBundle';
import { State } from 'types/State';
import { Recipe } from 'types/Recipe';

const InputContainer = styled.div`
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
`;

const TextInputContainer = styled.div`
  flex-grow: 2;
`;

const FixedContentContainer = styled.div`
  margin-bottom: 5px;
`;

// todo - copied
const ResultsHeadingContainer = styled.div`
  border-top: 1px solid ${theme.colors.greyVeryLight};
  align-items: baseline;
  display: flex;
  margin-bottom: 10px;
  flex-direction: row;
`;

// todo - copied
const Title = styled.h1`
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

type Props = {
  rightHandContainer?: React.ReactElement<any>;
  recipes: Recipe[];
};

const FeastSearchContainerComponent = ({
  rightHandContainer,
  recipes,
}: Props) => (
  <React.Fragment>
    <InputContainer>
      <TextInputContainer>
        <TextInput placeholder="Search recipes" displaySearchIcon />
      </TextInputContainer>
      <ClipboardHeader />
    </InputContainer>
    <FixedContentContainer>
      <ResultsHeadingContainer>
        <Title>
          {'Results'}
          <ShortVerticalPinline />
        </Title>
      </ResultsHeadingContainer>
      {recipes.map((recipe) => JSON.stringify(recipe))}
    </FixedContentContainer>
  </React.Fragment>
);

const mapStateToProps = (state: State) => ({
  recipes: recipeSelectors.selectAll(state),
});

export const FeastSearchContainer = connect(mapStateToProps)(
  FeastSearchContainerComponent
);
