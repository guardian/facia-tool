import React from 'react';
import { styled } from 'constants/theme';
import { SingleDatePicker } from 'react-dates';
import moment, { Moment } from 'moment';
import { EditionIssue } from 'types/Edition';
import Issue from './Issue';
import ButtonDefault from '../../shared/components/input/ButtonDefault';
// import * as ButtonDefault from '../shared/components/input/ButtonDefault';

interface ManageEditionState {
  date: Moment | null;
  isDatePickerOpen: boolean;
  issues: EditionIssue[];
  currentIssue: EditionIssue | null;
  createMessage: string;
}

const LinkButton = styled(ButtonDefault.withComponent('a'))`
  text-decoration: none;
  padding-top: 12px;
`;

const MsgBox = styled('div')`
  max-width: 200px;
  padding: 3px;
  color: white;
  background: linear-gradient(45deg, red, blue);
  background-size: 200% 2000%;
  animation: Animation 1s ease infinite;

  @keyframes Animation {
    0% {
      background-position: 10% 0%;
    }
    50% {
      background-position: 91% 100%;
    }
    100% {
      background-position: 10% 0%;
    }
  }
`;

const oneIssue = {
  id: '12348',
  name: 'Cool new issue just created',
  publishDate: '2019-06-29 19:10:25', // in format TimestampZ, eg 2016-06-22 19:10:25-07
  lastPublished: '2019-05-29 19:11:25',
  createdOn: '2016-06-22 19:10:25-07',
  createdBy: 'annaandjon',
  createdEmail: 'a@g.com'
};

const allIssues = [
  {
    id: '12345',
    name: 'MondayIssue',
    publishDate: '2019-05-29 19:10:25', // in format TimestampZ, eg 2016-06-22 19:10:25-07
    lastPublished: '2019-05-29 19:11:25',
    createdOn: '2016-06-22 19:10:25-07',
    createdBy: 'annaandjon',
    createdEmail: 'a@g.com'
  },
  {
    id: '12346',
    name: 'TuesdayIssue',
    publishDate: '2019-05-30 19:10:25', // in format TimestampZ, eg 2016-06-22 19:10:25-07
    lastPublished: '2019-05-29 19:11:25',
    createdOn: '2016-06-22 19:10:25-07',
    createdBy: 'annaandjon',
    createdEmail: 'a@g.com'
  },
  {
    id: '12347',
    name: 'WednesdayIssue',
    publishDate: '2019-05-31 19:10:25', // in format TimestampZ, eg 2016-06-22 19:10:25-07
    lastPublished: '2019-05-29 19:11:25',
    createdOn: '2016-06-22 19:10:25-07',
    createdBy: 'annaandjon',
    createdEmail: 'a@g.com'
  }
];

class ManageEdition extends React.Component {
  public state: ManageEditionState = {
    date: null,
    isDatePickerOpen: false,
    issues: [] as EditionIssue[],
    currentIssue: null,
    createMessage: ''
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
          isDayHighlighted={date => !!this.selectIssueForDate(date)}
        />
        <div>
          {this.state.date && (
            <>
              <p>You selected {this.state.date.format('Do MMMM YYYY')}</p>
              {this.state.currentIssue ? (
                <>
                  {this.state.createMessage && (
                    <MsgBox>{this.state.createMessage}</MsgBox>
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
                  <p>No issue found for this date</p>
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
    // select and instantiate template that is valid for this date
    if (!this.state.date) {
      return;
    }
    this.setState({ createMessage: 'New issue created' });
    this.createIssue(this.state.date).then(issue =>
      this.setState({ currentIssue: issue })
    );
  };

  private handleDateChange = (date: Moment | null) => {
    this.setState({ date });
    if (!date) {
      return;
    }
    const issue = this.selectIssueForDate(date);
    if (issue) {
      this.setState({ currentIssue: issue });
    } else {
      this.setState({ currentIssue: null });
    }
  };

  private handleFocusChange = (isFocussedObj: { focused: boolean | null }) => {
    if (isFocussedObj.focused) {
      const startDate = moment().startOf('month');
      const endDate = moment()
        .add(1, 'month')
        .endOf('month');
      this.fetchIssuesForDateRange(startDate, endDate).then(issues =>
        this.setState({ issues })
      );
    }
    this.setState({ isDatePickerOpen: !!isFocussedObj.focused });
  };

  private selectIssueForDate = (date: Moment) =>
    this.state.issues.find(i =>
      moment(i.publishDate, 'YYYY-MM-DD HH:mm:ss-ZZ').isSame(date, 'day')
    );

  private handleMonthClick = (month: Moment) => {
    const startDate = month.clone().startOf('month');
    const endDate = month.clone().endOf('month');

    this.fetchIssuesForDateRange(startDate, endDate).then(issues =>
      this.setState({ issues })
    );
  };

  private fetchIssuesForDateRange = async (
    start: Moment,
    end: Moment
  ): Promise<EditionIssue[]> => {
    return allIssues;
  };

  private createIssue = async (date: Moment): Promise<EditionIssue> => oneIssue;
}

export default ManageEdition;
