import ClipboardHeader from 'components/ClipboardHeader';
import TextInput from 'components/inputs/TextInput';
import ShortVerticalPinline from 'components/layout/ShortVerticalPinline';
import { styled } from 'constants/theme';
import React from 'react';
import { connect } from 'react-redux';
import { selectors as recipeSelectors } from 'bundles/recipesBundle';
import { State } from 'types/State';
import { Recipe } from 'types/Recipe';
import { SearchResultsHeadingContainer } from './SearchResultsHeadingContainer';
import { SearchTitle } from './SearchTitle';
<<<<<<< HEAD
import { RecipeFeedItem } from './RecipeFeedItem';
=======
>>>>>>> d2690845bf (Tidy up)

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
  recipes: Record<string, Recipe>;
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
      {Object.values(recipes).map((recipe) => (
        <RecipeFeedItem key={recipe.id} recipe={recipe} />
      ))}
    </FixedContentContainer>
  </React.Fragment>
);

const mapStateToProps = (state: State) => ({
  recipes: recipeSelectors.selectAll(state),
});

export const RecipeSearchContainer = connect(mapStateToProps)(
  FeastSearchContainerComponent
);
