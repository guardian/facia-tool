import ClipboardHeader from 'components/ClipboardHeader';
import TextInput from 'components/inputs/TextInput';
import { styled } from 'constants/theme';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectors as recipeSelectors } from 'bundles/recipesBundle';
import { fetchChefs, selectors as chefSelectors } from 'bundles/chefsBundle';
import { State } from 'types/State';
import { Recipe } from 'types/Recipe';
import { RecipeFeedItem } from './RecipeFeedItem';
import { ChefFeedItem } from './ChefFeedItem';
import { RadioButton, RadioGroup } from '../inputs/RadioButtons';
import { Dispatch } from 'types/Store';
//import debounce from 'lodash/debounce'; // needed for debounce work, mentioned in Todo below
import { IPagination } from 'lib/createAsyncResourceBundle';
import Pagination from './Pagination';
import ScrollContainer from '../ScrollContainer';

const InputContainer = styled.div`
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
`;

const TextInputContainer = styled.div`
  flex-grow: 2;
`;

interface Props {
  rightHandContainer?: React.ReactElement<any>;
}

const PaginationContainer = styled.div`
  margin-left: auto;
`;

const TopOptions = styled.div`
  display: flex;
  flex-direction: row;
`;

const FeedsContainerWrapper = styled.div`
  height: 100%;
`;

const ResultsContainer = styled.div`
  margin-right: 10px;
`;

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
  const searchForChefs = useCallback(
    (params: Record<string, string[] | string | number>) => {
      dispatch(fetchChefs(params));
    },
    [dispatch]
  );
  const chefSearchIds = useSelector((state: State) =>
    chefSelectors.selectLastFetchOrder(state)
  );

  const [page, setPage] = useState(1);

  /*const debouncedRunSearch = debounce(() => runSearch(page), 750); TODO need to check if needed for chef-search? if yes then how to improve implementing it*/

  useEffect(() => {
    runSearch(page);
  }, [selectedOption, searchText, page]);

  const chefsPagination: IPagination | null = useSelector((state: State) =>
    chefSelectors.selectPagination(state)
  );

  const hasPages = (chefsPagination?.totalPages ?? 0) > 1;

  const getParams = (query: string) => ({
    'web-title': query,
    'page-size': '20',
    'show-elements': 'image',
    'show-fields': 'all',
  });

  const runSearch = useCallback(
    (page: number = 1) => {
      const fetch =
        selectedOption === FeedType.chefs ? searchForChefs : () => {};
      fetch({
        ...getParams(searchText),
        page,
      });
    },
    [selectedOption, searchText, page]
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
            placeholder={
              selectedOption === FeedType.recipes
                ? 'Search recipes'
                : 'Search chefs'
            }
            displaySearchIcon
            onChange={(event) => {
              setPage(1);
              setSearchText(event.target.value);
            }}
            value={searchText}
          />
        </TextInputContainer>
        <ClipboardHeader />
      </InputContainer>
      <TopOptions>
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
        {selectedOption === FeedType.chefs && chefsPagination && hasPages && (
          <PaginationContainer>
            <Pagination
              pageChange={(page) => setPage(page)}
              currentPage={chefsPagination.currentPage}
              totalPages={chefsPagination.totalPages}
            />
          </PaginationContainer>
        )}
      </TopOptions>
      <FeedsContainerWrapper>
        <ScrollContainer fixed={<h3>Results</h3>}>
          <ResultsContainer>{renderTheFeed()}</ResultsContainer>
        </ScrollContainer>
      </FeedsContainerWrapper>
    </React.Fragment>
  );
};
