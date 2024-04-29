import ClipboardHeader from 'components/ClipboardHeader';
import TextInput from 'components/inputs/TextInput';
import ShortVerticalPinline from 'components/layout/ShortVerticalPinline';
import { styled, theme } from 'constants/theme';
import React from 'react';
import { connect } from 'react-redux';
import { selectors as recipeSelectors } from 'bundles/recipesBundle';
import { State } from 'types/State';
import { Recipe } from 'types/Recipe';
import { SearchResultsHeadingContainer } from './SearchResultsHeadingContainer';
import { SearchTitle } from './SearchTitle';
import {RecipeFeedItem} from "./RecipeFeedItem";

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

interface Props {
  rightHandContainer?: React.ReactElement<any>;
  recipes: Recipe[];
}

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
      <SearchResultsHeadingContainer>
        <SearchTitle>
          {'Results'}
          <ShortVerticalPinline />
        </SearchTitle>
      </SearchResultsHeadingContainer>
      {recipes.map((recipe) => <RecipeFeedItem recipe={recipe} />)}
    </FixedContentContainer>
  </React.Fragment>
);

const mapStateToProps = (state: State) => ({
  recipes: recipeSelectors.selectAll(state),
});

export const RecipeSearchContainer = connect(mapStateToProps)(
  FeastSearchContainerComponent
);
