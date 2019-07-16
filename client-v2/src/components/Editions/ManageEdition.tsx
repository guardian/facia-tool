import React from 'react';
import startCase from 'lodash/startCase';
import { styled } from 'constants/theme';
import { SingleDatePicker } from 'react-dates';
import moment, { Moment } from 'moment';
import { EditionsIssue } from 'types/Edition';
import Issue from './Issue';
import ButtonDefault from '../../shared/components/input/ButtonDefault';
import {
  fetchIssuesForDateRange,
  fetchIssueByDate,
  createIssue
} from 'services/editionsApi';
import { withRouter, RouteComponentProps } from 'react-router';
import Spinner from 'shared/components/async/Spinner';
import InformationMsg from 'shared/components/alert/InformationMsg';
import urls from 'constants/urls';

interface ManageEditionState {
  date: Moment | null;
  isDatePickerOpen: boolean;
  issues: EditionsIssue[];
  currentIssue: EditionsIssue | null;
  infoMessage: string;
  isError: boolean;
  isLoading: boolean;
  isCreatingIssue: boolean;
}

const LinkButton = styled(ButtonDefault.withComponent('a'))`
  text-decoration: none;
  padding-top: 12px;
`;

const SpinnerContainer = styled.div`
  margin-left: 10px;
  display: inline-block;
  vertical-align: middle;
`;

const IssueContainer = styled.div`
  margin: 10px 0;
`;

class ManageEdition extends React.Component<
  RouteComponentProps<{ editionName: string }>
> {
  public state: ManageEditionState = {
    date: null,
    isDatePickerOpen: false,
    issues: [] as EditionsIssue[],
    currentIssue: null,
    infoMessage: '',
    isError: false,
    isLoading: false,
    isCreatingIssue: false
  };

  public render() {
    return (
      <>
        <h2>{startCase(this.props.match.params.editionName)}</h2>
        <h4>Select a date to create or edit an issue.</h4>
        <div>
          <span>
            <SingleDatePicker
              date={this.state.date}
              onDateChange={this.handleDateChange}
              focused={this.state.isDatePickerOpen}
              onFocusChange={this.handleFocusChange}
              onNextMonthClick={this.handleMonthClick}
              onPrevMonthClick={this.handleMonthClick}
              id="editions-date"
              displayFormat="DD-MM-YYYY"
              isDayHighlighted={date => !!this.isIssuePresentForDate(date)}
              isOutsideRange={() => false}
            />
          </span>
          {this.state.isLoading && (
            <SpinnerContainer>
              <Spinner />
            </SpinnerContainer>
          )}
        </div>
        {this.state.infoMessage && (
          <InformationMsg status={this.state.isError ? 'error' : 'info'}>
            {this.state.infoMessage}
          </InformationMsg>
        )}
        {this.state.date && this.renderIssueData()}
      </>
    );
  }

  private renderIssueData = () => {
    const hasCurrentIssue =
      !this.state.isLoading && this.state.currentIssue
        ? this.state.currentIssue
        : null;
    // We don't want to remove the no current issue information as a new issue is being created
    const noCurrentIssue = !this.state.isLoading || this.state.isCreatingIssue;
    const selectedDateText = this.state.date
      ? this.state.date.format('DD-MM-YYYY')
      : '';
    return hasCurrentIssue ? (
      <>
        <h3>Current issue: {selectedDateText}</h3>
        <IssueContainer>
          <Issue issue={this.state.currentIssue!} />
        </IssueContainer>
        <LinkButton
          size="l"
          href={`/${urls.appRoot}/issues/${this.state.currentIssue!.id}`}
        >
          Open
        </LinkButton>
      </>
    ) : (
      noCurrentIssue && (
        <>
          <p>No issue found for {selectedDateText}</p>
          <p>
            <ButtonDefault
              size="l"
              disabled={this.state.isCreatingIssue}
              onClick={this.createEdition}
            >
              Create issue
            </ButtonDefault>
          </p>
        </>
      )
    );
  };

  private createEdition = () => {
    if (!this.state.date) {
      this.setState({ infoMessage: 'Please select a date.', isError: true });
      return;
    }
    this.handleLoadingState(
      createIssue(this.props.match.params.editionName, this.state.date).then(
        issue => {
          this.setState({
            infoMessage: 'New issue created!',
            isError: false,
            currentIssue: issue,
            isCreatingIssue: false
          });
        }
      ),
      `Creating an issue for the date ${this.state.date.format(
        'DD-MM-YYYY'
      )} failed`,
      'isCreatingIssue'
    );
  };

  private handleDateChange = (date: Moment | null) => {
    if (!date) {
      return;
    }
    this.setState({
      date,
      infoMessage: '',
      isError: false,
      currentIssue: null
    });
    this.handleLoadingState(
      fetchIssueByDate(this.props.match.params.editionName, date).then(issue =>
        this.setState({ currentIssue: issue || null })
      ),
      `Could not fetch an issue for the date ${date.format('DD-MM-YYYY')}`
    );
  };

  private handleFocusChange = (isFocussedObj: { focused: boolean | null }) => {
    this.setState({ isDatePickerOpen: !!isFocussedObj.focused });
    if (isFocussedObj.focused) {
      const startDate = moment().startOf('month');
      const endDate = moment()
        .add(1, 'month')
        .endOf('month');
      this.fetchDateRange(startDate, endDate);
    }
  };

  private isIssuePresentForDate = (date: Moment) =>
    this.state.issues.find(i => moment(i.issueDate).isSame(date, 'day'));

  private handleMonthClick = (month: Moment) => {
    const startDate = month.clone().startOf('month');
    const endDate = month
      .clone()
      .add(1, 'month')
      .endOf('month');

    this.fetchDateRange(startDate, endDate);
  };

  private fetchDateRange = (startDate: Moment, endDate: Moment) => {
    this.handleLoadingState(
      fetchIssuesForDateRange(
        this.props.match.params.editionName,
        startDate,
        endDate
      ).then(issues => this.setState({ issues })),
      `Fetching issues for this date range failed: ${startDate} to ${endDate}`
    );
  };

  private handleLoadingState = async <T extends void>(
    promise: Promise<T>,
    errorMessage: string,
    extraLoadingKey?: string
  ) => {
    this.setState(this.addExtraKey({ isLoading: true }, extraLoadingKey, true));
    try {
      await promise.then(() => this.setState({ isLoading: false }));
    } catch (response) {
      this.setState(
        this.addExtraKey(
          {
            infoMessage: `${errorMessage}: ${response.status}, ${
              response.statusText
            }`,
            isError: true,
            isLoading: false
          },
          extraLoadingKey,
          false
        )
      );
    }
  };

  private addExtraKey = <Obj extends {}, Val>(
    obj: Obj,
    key: string | undefined,
    value: Val
  ) =>
    key
      ? {
          ...obj,
          [key]: value
        }
      : obj;
}

export default withRouter(ManageEdition);
