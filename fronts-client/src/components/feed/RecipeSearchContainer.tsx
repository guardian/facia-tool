import ClipboardHeader from 'components/ClipboardHeader';
import TextInput from 'components/inputs/TextInput';
import ShortVerticalPinline from 'components/layout/ShortVerticalPinline';
import { styled } from 'constants/theme';
import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
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
import { Dispatch } from '../../types/Store';

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

enum FeedType {
  recipes = 'recipeFeed',
  chefs = 'chefFeed',
}

const FeastSearchContainerComponent = ({
  rightHandContainer,
  recipes,
  chefs,
}: Props) => {
  const [selectedOption, setSelectedOption] = useState(FeedType.recipes);
  const [intervalId, setIntervalId] = useState(null);
  const [inputState, setInputState] = useState({ query: '', chefs: [] });

  const handleOptionChange = (optionName: FeedType) => {
    setSelectedOption(optionName);
  };

  const getParams = (query: string) => ({
    q: query,
    'page-size': '20',
    'show-elements': 'image',
    'show-fields': 'all',
  });

  // Function to stop polling
  const stopPolling = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  const runSearch = useCallback(
    (page = 1) => {
      const id = getIdFromURL(inputState.query);
      const searchTerm = id ? id : inputState.query;
      //const isLive = capiFeedIndex === 0;
      //const fetch = isLive ? this.props.fetchLive : this.props.fetchPreview;
      const fetch = selectedOption === FeedType.chefs ? chefs : recipes;
      fetch(
        {
          ...getParams(searchTerm),
          page,
        },
        !!id
      );
    },
    [inputState]
  );

  const runSearchAndRestartPolling = useCallback(() => {
    stopPolling();
    const newIntervalId = setInterval(() => {
      runSearch();
    }, 30000);
    setIntervalId(newIntervalId);
    runSearch();
  }, [stopPolling, runSearch]);
  //
  // useEffect(() => {
  //   return () => stopPolling();
  // }, [stopPolling]);

  const renderTheFeed = () => {
    switch (selectedOption) {
      case FeedType.recipes:
        return Object.values(recipes).map((recipe) => (
          <RecipeFeedItem key={recipe.id} recipe={recipe} />
        ));
      case FeedType.chefs:
        return Object.values(chefs).map((chef) => (
          <ChefFeedItem key={chef.id} chef={chef} />
        ));
    }
  };

  return (
    <React.Fragment>
      <InputContainer>
        <TextInputContainer>
          <TextInput placeholder="Search recipes" displaySearchIcon />
          <div>
            <button onClick={runSearchAndRestartPolling}>Start Search</button>
            <button onClick={stopPolling}>Stop Search</button>
          </div>
        </TextInputContainer>
        <ClipboardHeader />
      </InputContainer>
      <RadioGroup>
        <RadioButton
          checked={selectedOption === FeedType.recipes}
          onChange={() => handleOptionChange(FeedType.recipes)}
          label="Recipes"
          inline
          name="recipeFeed"
        />
        <RadioButton
          checked={selectedOption === FeedType.chefs}
          onChange={() => handleOptionChange(FeedType.chefs)}
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

const mapStateToProps = (state: State, dispatch: Dispatch) => ({
  recipes: recipeSelectors.selectAll(state),
  chefs: (params: object, isResource: boolean) =>
    dispatch(fetchLive(params, isResource)),
});

//chefs: chefSelectors.selectAll(state),

export const RecipeSearchContainer = connect(mapStateToProps)(
  FeastSearchContainerComponent
);
