import React from 'react';
import Raven from 'raven-js';
import { styled } from 'constants/theme';
import { SingleDatePicker } from 'react-dates';
import moment, { Moment } from 'moment';
import { EditionIssue } from 'types/Edition';
import Issue from './Issue';
import ButtonDefault from '../../shared/components/input/ButtonDefault';
import {
  fetchIssuesForDateRange,
  fetchIssueByDate,
  createIssue
} from 'services/editionsApi';

interface ManageEditionState {
  date: Moment | null;
  isDatePickerOpen: boolean;
  issues: EditionIssue[];
  currentIssue: EditionIssue | null;
  infoMessage: string;
  isError: boolean;
}

const LinkButton = styled(ButtonDefault.withComponent('a'))`
  text-decoration: none;
  padding-top: 12px;
`;

const InformationMsg = styled.div<{ status?: 'info' | 'error' }>`
  max-width: 250px;
  margin: 5px 0;
  padding: 3px;
  color: white;
  background-color: ${props => (props.status === 'info' ? 'green' : 'red')};
`;

class ManageEdition extends React.Component {
  public state: ManageEditionState = {
    date: null,
    isDatePickerOpen: false,
    issues: [] as EditionIssue[],
    currentIssue: null,
    infoMessage: '',
    isError: false
  };

  public render() {
    return (
      <>
        <h2>Pick a date</h2>
        <SingleDatePicker
          date={null}
          onDateChange={this.handleDateChange}
          focused={this.state.isDatePickerOpen}
          onFocusChange={this.handleFocusChange}
          onNextMonthClick={this.handleMonthClick}
          onPrevMonthClick={this.handleMonthClick}
          id="editions-date"
          isDayHighlighted={date => !!this.checkIssuePresentForDate(date)}
          isOutsideRange={() => false}
        />
        <div>
          {this.state.date && (
            <>
              <p>You selected {this.state.date.format('Do MMMM YYYY')}</p>
              {this.state.currentIssue ? (
                <>
                  {this.state.infoMessage && (
                    <InformationMsg
                      status={this.state.isError ? 'error' : 'info'}
                    >
                      {this.state.infoMessage}
                    </InformationMsg>
                  )}
                  <Issue issue={this.state.currentIssue} />
                  <LinkButton
                    size="l"
                    href={`editions/${this.state.currentIssue.id}`}
                  >
                    Open
                  </LinkButton>
                </>
              ) : (
                <>
                  <InformationMsg status="info">
                    No issue found for this date
                  </InformationMsg>
                  <ButtonDefault size="l" onClick={this.createEdition}>
                    Create
                  </ButtonDefault>
                </>
              )}
            </>
          )}
        </div>
      </>
    );
  }

  private createEdition = () => {
    if (!this.state.date) {
      Raven.captureMessage(
        `Creating an issue failed because no date was selected`
      );
      this.setState({ infoMessage: 'The date is not valid', isError: true });
      return;
    }
    this.setState({ infoMessage: 'New issue created' });
    createIssue(this.state.date)
      .then(issue => {
        this.setState({ currentIssue: issue });
      })
      .catch(err => {
        Raven.captureMessage(
          `Creating an issue for this date ${this.state.date} failed`,
          err
        );
        this.setState({
          infoMessage: 'Sorry creating an issue for this date failed',
          isError: true
        });
      });
  };

  private handleDateChange = (date: Moment | null) => {
    this.setState({ date, infoMessage: '', isError: false });
    if (!date) {
      return;
    }
    fetchIssueByDate(date).then(issue => {
      if (issue) {
        this.setState({ currentIssue: issue });
      } else {
        this.setState({ currentIssue: null });
      }
    });
  };

  private handleFocusChange = (isFocussedObj: { focused: boolean | null }) => {
    if (isFocussedObj.focused) {
      const startDate = moment().startOf('month');
      const endDate = moment()
        .add(1, 'month')
        .endOf('month');
      fetchIssuesForDateRange(startDate, endDate).then(issues =>
        this.setState({ issues })
      );
    }
    this.setState({ isDatePickerOpen: !!isFocussedObj.focused });
  };

  private checkIssuePresentForDate = (date: Moment) =>
    this.state.issues.find(i =>
      moment(i.publishDate, 'YYYY-MM-DD HH:mm:ss-ZZ').isSame(date, 'day')
    );

  private handleMonthClick = (month: Moment) => {
    const startDate = month.clone().startOf('month');
    const endDate = month.clone().endOf('month');

    fetchIssuesForDateRange(startDate, endDate)
      .then(issues => this.setState({ issues }))
      .catch(err => {
        Raven.captureMessage(
          `Fetching issues for this date range failed: ${startDate} to ${endDate}`,
          err
        );
        this.setState({
          infoMessage: `Fetching issues for this date range failed: ${startDate} to ${endDate}`
        });
      });
  };
}

export default ManageEdition;
