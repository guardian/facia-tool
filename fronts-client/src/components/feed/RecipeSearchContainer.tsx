import ClipboardHeader from 'components/ClipboardHeader';
import TextInput from 'components/inputs/TextInput';
import ShortVerticalPinline from 'components/layout/ShortVerticalPinline';
import { styled } from 'constants/theme';
import React from 'react';
import { connect } from 'react-redux';
import { selectors as recipeSelectors } from 'bundles/recipesBundle';
import { selectors as chefSelectors } from 'bundles/chefsBundle';
import { State } from 'types/State';
import { Recipe } from 'types/Recipe';
import { Chef } from 'types/Chef';
import { SearchResultsHeadingContainer } from './SearchResultsHeadingContainer';
import { SearchTitle } from './SearchTitle';
import { RecipeFeedItem } from './RecipeFeedItem';
import { ChefFeedItem } from './ChefFeedItem';

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
  chefs: Record<string, Chef>;
}

const FeastSearchContainerComponent = ({
  rightHandContainer,
  recipes,
  chefs,
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
      {Object.values(chefs).map((chef) => (
        <ChefFeedItem
          key={chef.id}
          chef={chef}
        /> /*TODO: as of now, added rendering of chefs just after the recipes. Need
      to change when "search-chefs" action gets finalised*/
      ))}
    </FixedContentContainer>
  </React.Fragment>
);

const mapStateToProps = (state: State) => ({
  recipes: recipeSelectors.selectAll(state),
  chefs: chefSelectors.selectAll(state),
});

export const RecipeSearchContainer = connect(mapStateToProps)(
  FeastSearchContainerComponent
);
