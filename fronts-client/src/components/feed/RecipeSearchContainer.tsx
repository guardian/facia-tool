import ClipboardHeader from 'components/ClipboardHeader';
import TextInput from 'components/inputs/TextInput';
import { styled } from 'constants/theme';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	fetchRecipes,
	selectors as recipeSelectors,
} from 'bundles/recipesBundle';
import { fetchChefs, selectors as chefSelectors } from 'bundles/chefsBundle';
import { State } from 'types/State';
import { RecipeFeedItem } from './RecipeFeedItem';
import { ChefFeedItem } from './ChefFeedItem';
import { RadioButton, RadioGroup } from '../inputs/RadioButtons';
import { Dispatch } from 'types/Store';
import { IPagination } from 'lib/createAsyncResourceBundle';
import Pagination from './Pagination';
import ScrollContainer from '../ScrollContainer';
import { ChefSearchParams, DateParamField, RecipeSearchParams } from '../../services/recipeQuery';
import debounce from 'lodash/debounce';
import { isNaN } from 'lodash';
import ButtonDefault from '../inputs/ButtonDefault';

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

  const [showAdvancedRecipes, setShowAdvancedRecipes] = useState(false);
  const [dateField, setDateField] = useState<DateParamField>(undefined);
  const [uprateDropoffScale, setUprateDropoffScale] = useState<
    number | undefined
  >(90);
  const [uprateOffsetDays, setUprateOffsetDays] = useState(7);
  const [uprateDecay, setUprateDecay] = useState(0.95);

  const dispatch: Dispatch = useDispatch();
  const searchForChefs = useCallback(
    (params: ChefSearchParams) => {
      dispatch(fetchChefs(params));
    },
    [dispatch]
  );
  const searchForRecipes = useCallback(
    (params: RecipeSearchParams) => {
      dispatch(fetchRecipes(params));
    },
    [dispatch]
  );
  const recipeSearchIds = useSelector((state: State) =>
    recipeSelectors.selectLastFetchOrder(state)
  );

	const chefSearchIds = useSelector((state: State) =>
		chefSelectors.selectLastFetchOrder(state),
	);

	const [page, setPage] = useState(1);

	/*const debouncedRunSearch = debounce(() => runSearch(page), 750); TODO need to check if needed for chef-search? if yes then how to improve implementing it*/

  useEffect(() => {
    const dbf = debounce(() => runSearch(page), 750);
    dbf();
    return () => dbf.cancel();
  }, [
    selectedOption,
    searchText,
    page,
    dateField,
    uprateDecay,
    uprateDropoffScale,
    uprateOffsetDays
  ]);

	const chefsPagination: IPagination | null = useSelector((state: State) =>
		chefSelectors.selectPagination(state),
	);

	const hasPages = (chefsPagination?.totalPages ?? 0) > 1;

  const runSearch = useCallback(
    (page: number = 1) => {
      switch (selectedOption) {
        case FeedType.chefs:
          searchForChefs({
            query: searchText
          });
          break;
        case FeedType.recipes:
          searchForRecipes({
            queryText: searchText,
            uprateByDate: dateField,
            uprateConfig: {
              decay: uprateDecay,
              dropoffScaleDays: uprateDropoffScale,
              offsetDays: uprateOffsetDays
            }
          });
          break;
      }
    },
    [
      selectedOption,
      searchText,
      page,
      dateField,
      uprateDecay,
      uprateDropoffScale,
      uprateOffsetDays
    ]
  );

  const renderTheFeed = () => {
    switch (selectedOption) {
      case FeedType.recipes:
        return recipeSearchIds.map((id) => (
          <RecipeFeedItem key={id} id={id} />
        ));
      case FeedType.chefs:
        //Fixing https://the-guardian.sentry.io/issues/5820707430/?project=35467&referrer=issue-stream&statsPeriod=90d&stream_index=0&utc=true
        //It seems that some null values got into the `chefSearchIds` list
        return chefSearchIds.filter(chefId => !!chefId).map((chefId) => (
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
            onClick={() => setShowAdvancedRecipes(true)}
            value={searchText}
          />
        </TextInputContainer>
        <ClipboardHeader />
      </InputContainer>

      {showAdvancedRecipes ? (
        <>
          <TopOptions style={{marginBottom: "0.4em"}}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ flex: 1 }}>
                <TextInput
                  style={{ padding: 0 }}
                  displaySearchIcon={false}
                  id="uprateDropoffScale"
                  type="number"
                  value={uprateDropoffScale?.toString() ?? ''}
                  onChange={(evt) => {
                    const newVal = parseInt(evt.target.value);
                    if (!isNaN(newVal)) setUprateDropoffScale(newVal);
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <TextInput
                  style={{ padding: 0 }}
                  displaySearchIcon={false}
                  id="uprateOffset"
                  type="number"
                  value={uprateOffsetDays?.toString() ?? ''}
                  onChange={(evt) => {
                    const newVal = parseInt(evt.target.value);
                    if (!isNaN(newVal)) setUprateOffsetDays(newVal);
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <TextInput
                  style={{ padding: 0 }}
                  displaySearchIcon={false}
                  id="uprateOffset"
                  type="number"
                  value={uprateDecay?.toString() ?? ''}
                  onChange={(evt) => {
                    const newVal = parseFloat(evt.target.value);
                    if (!isNaN(newVal)) setUprateDecay(newVal);
                  }}
                />
              </div>
            </div>
          </TopOptions>
          <TopOptions>
            <div style={{ display: 'block' }}>
              <label htmlFor="dateSelector">Ordering priority</label>
              <select
                id="dateSelector"
                value={dateField}
                onChange={(evt) => {
                  console.log(evt.target);
                  setDateField(
                    evt.target.value === 'Relevance'
                      ? undefined
                      : (evt.target.value as DateParamField)
                  );
                }}
              >
                <option value={'Relevance'}>
                  Most relevant, regardless of time
                </option>
                <option value={'publishedDate'}>Most recently published</option>
                <option value={'firstPublishedDate'}>
                  Most recent first publication
                </option>
                <option value={'lastModifiedDate'}>
                  Most recently modified
                </option>
              </select>
            </div>
          </TopOptions>
          <TopOptions style={{marginBottom: "1.2em"}}>
            <ButtonDefault onClick={()=>setShowAdvancedRecipes(false)}>Close</ButtonDefault>
          </TopOptions>
        </>
      ) : undefined}

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
