import React from 'react';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { DateRangePicker } from 'react-dates';
import { styled } from 'constants/theme';
import moment from 'moment';

interface CAPIDateInputProps {
  start: moment.Moment | null;
  end: moment.Moment | null;
  onDateChange: (
    startDate: moment.Moment | null,
    endDate: moment.Moment | null
  ) => void;
}

interface CAPIDateInputState {
  focusedInput: 'startDate' | 'endDate' | null;
}

const DatePickerContainer = styled('div')`
  padding-top: 24px;
  padding-left: 2px;
`;

const SearchTitle = styled('div')`
  font-weight: bold;
  margin-right: 3px;
  margin-bottom: 7px;
`;

const DatePicker = styled('div')`
  .DateInput_input {
    font-size: 16px;
    font-family: TS3TextSans;
    color: #121212;
  }

  .DateRangePickerInput__withBorder {
    border: solid 1px #c9c9c9;
  }

  .CalendarMonth_caption {
    color: #121212;
    font-family: TS3TextSans;
  }

  .CalendarDay__selected {
    background: #ff7f0f;
    border: 1px double #444444;
    color: #121212;
  }

  .CalendarDay__selected_span {
    background: #dcdcdc;
    border: 1px double #444444;
    color: #121212;
  }

  .CalendarDay__hovered_span,
 .CalendarDay__hovered_span: hover {
    background: #f2f2f2;
    border: 1px double #444444;
    color: #121212;
  }

  .CalendarDay__selected: hover,
 .CalendarDay__selected_span: hover {
    background: #dcdcdc;
    border: 1px double #444444;
    color: #121212;
  }
`;

export default class CAPIDateRangeInput extends React.Component<
  CAPIDateInputProps,
  CAPIDateInputState
> {
  public state = {
    focusedInput: null
  };

  public render() {
    const { start, end, onDateChange } = this.props;

    return (
      <DatePickerContainer>
        <SearchTitle> Date Range: </SearchTitle>
        <DatePicker>
          <DateRangePicker
            displayFormat="DD/MM/YYYY"
            minimumNights={0}
            startDate={start}
            startDateId="startDateId"
            endDate={end}
            endDateId="endDateId"
            onDatesChange={({ startDate, endDate }) => {
              onDateChange(startDate, endDate);
            }}
            initialVisibleMonth={() => moment().subtract(1, 'months')}
            isOutsideRange={day => day.isAfter(moment())}
            focusedInput={this.state.focusedInput}
            onFocusChange={focusedInput => {
              this.setState({ focusedInput });
            }}
          />
        </DatePicker>
      </DatePickerContainer>
    );
  }
}
