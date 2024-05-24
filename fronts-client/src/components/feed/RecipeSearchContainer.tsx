import ClipboardHeader from 'components/ClipboardHeader';
import TextInput from 'components/inputs/TextInput';
import ShortVerticalPinline from 'components/layout/ShortVerticalPinline';
import { styled } from 'constants/theme';
import React, { useState } from 'react';
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
import { RadioButton, RadioGroup } from '../inputs/RadioButtons';

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
}: Props) => {
  const [selectedOption, setSelectedOption] = useState<string>('recipeFeed');
  const handleOptionChange = (optionName: string) => {
    setSelectedOption(optionName);
  };
  return (
    <React.Fragment>
      <InputContainer>
        <TextInputContainer>
          <TextInput placeholder="Search recipes" displaySearchIcon />
        </TextInputContainer>
        <ClipboardHeader />
      </InputContainer>
      <RadioGroup>
        <RadioButton
          checked={selectedOption === 'recipeFeed'}
          onChange={() => handleOptionChange('recipeFeed')}
          label="Recipes"
          inline
          name="recipeFeed"
        />
        <RadioButton
          checked={selectedOption === 'chefFeed'}
          onChange={() => handleOptionChange('chefFeed')}
          label="Chefs"
          inline
          name="chefFeed"
        />
      </RadioGroup>
      <FixedContentContainer>
        <SearchResultsHeadingContainer>
          <SearchTitle>
            {'Results'}
            <ShortVerticalPinline />
          </SearchTitle>
        </SearchResultsHeadingContainer>
        {selectedOption === 'recipeFeed'
          ? Object.values(recipes).map((recipe) => (
              <RecipeFeedItem key={recipe.id} recipe={recipe} />
            ))
          : Object.values(chefs).map((chef) => (
              <ChefFeedItem key={chef.id} chef={chef} />
            ))}
      </FixedContentContainer>
    </React.Fragment>
  );
};

const mapStateToProps = (state: State) => ({
  recipes: recipeSelectors.selectAll(state),
  chefs: chefSelectors.selectAll(state),
});

export const RecipeSearchContainer = connect(mapStateToProps)(
  FeastSearchContainerComponent
);
