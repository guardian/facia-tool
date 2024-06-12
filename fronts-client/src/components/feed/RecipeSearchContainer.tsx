import ClipboardHeader from 'components/ClipboardHeader';
import TextInput from 'components/inputs/TextInput';
import ShortVerticalPinline from 'components/layout/ShortVerticalPinline';
import { styled } from 'constants/theme';
import React, { useEffect, useState, useCallback } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { selectors as recipeSelectors } from 'bundles/recipesBundle';
import { fetchLive, selectors as chefSelectors } from 'bundles/chefsBundle';
import { State } from 'types/State';
import { Recipe } from 'types/Recipe';
import { Chef } from 'types/Chef';
import { SearchResultsHeadingContainer } from './SearchResultsHeadingContainer';
import { SearchTitle } from './SearchTitle';
import { RecipeFeedItem } from './RecipeFeedItem';
import { ChefFeedItem } from './ChefFeedItem';
import { RadioButton, RadioGroup } from '../inputs/RadioButtons';
import { getIdFromURL } from '../../util/CAPIUtils';
import { Dispatch } from 'types/Store';

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
}

enum FeedType {
  recipes = 'recipeFeed',
  chefs = 'chefFeed',
}

export const RecipeSearchContainer = ({ rightHandContainer }: Props) => {
  const [selectedOption, setSelectedOption] = useState(FeedType.recipes);
  const [searchText, setSearchText] = useState('');
  const recipes: Record<string, Recipe> = useSelector((state: State) =>
    recipeSelectors.selectAll(state)
  );
  const dispatch: Dispatch = useDispatch();
  const fetchChefs = useCallback(
    (params: object, isResource: boolean) => {
      dispatch(fetchLive(params, isResource));
    },
    [dispatch]
  );
  const chefSearchIds = useSelector((state: State) =>
    chefSelectors.selectLastFetchOrder(state)
  );

  useEffect(() => {
    runSearch();
  }, [selectedOption, searchText]);

  const getParams = (query: string) => ({
    'web-title': query,
    'page-size': '20',
    'show-elements': 'image',
    'show-fields': 'all',
  });

  const runSearch = useCallback(
    (page = 1) => {
      const fetch = selectedOption === FeedType.chefs ? fetchChefs : () => {};
      fetch(
        {
          ...getParams(searchText),
          page,
        },
        false
      );
    },
    [selectedOption, searchText]
  );

  const renderTheFeed = () => {
    switch (selectedOption) {
      case FeedType.recipes:
        return Object.values(recipes).map((recipe) => (
          <RecipeFeedItem key={recipe.id} recipe={recipe} />
        ));
      case FeedType.chefs:
        return chefSearchIds.map((chefId) => (
          <ChefFeedItem key={chefId} id={chefId} />
        ));
    }
  };

  return (
    <React.Fragment>
      <InputContainer>
        <TextInputContainer>
          <TextInput
            placeholder="Search recipes"
            displaySearchIcon
            onChange={(event) => {
              setSearchText(event.target.value);
            }}
            value={searchText}
          />
        </TextInputContainer>
        <ClipboardHeader />
      </InputContainer>
      <RadioGroup>
        <RadioButton
          checked={selectedOption === FeedType.recipes}
          onChange={() => setSelectedOption(FeedType.recipes)}
          label="Recipes"
          inline
          name="recipeFeed"
        />
        <RadioButton
          checked={selectedOption === FeedType.chefs}
          onChange={() => setSelectedOption(FeedType.chefs)}
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
        {renderTheFeed()}
      </FixedContentContainer>
    </React.Fragment>
  );
};
