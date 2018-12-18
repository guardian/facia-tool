import React from 'react';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import styled from 'styled-components';
import moment from 'moment';

interface CAPIDateInputProps {
  start: moment.Moment | null
  end: moment.Moment | null
  onDateChange: (startDate: moment.Moment, endDate: moment.Moment) => void
}

interface CAPIDateInputState {
  focusedInput: 'startDate' | 'endDate' | null
}

const DatePickerContainer = styled('div')`
  padding-top: 24px;
  padding-left: 2px;

`;

const SearchTitle = styled('div')`
  font-size: 16px;
  font-weight: bold;
  color: #121212;
  margin-right: 3px;
  float: left;
  margin-bottom: 5px;
`;

export default class CAPIDateRangeInput extends React.Component<CAPIDateInputProps, CAPIDateInputState> {

  public state = {
    focusedInput: null
  };

  public render() {

    const { start, end, onDateChange } = this.props;

    return (
      <DatePickerContainer>
        <SearchTitle> Date Range: </SearchTitle>
        <DateRangePicker
          displayFormat='DD/MM/YYYY'
          minimumNights={0}
          startDate={start}
          startDateId="startDateId"
          endDate={end}
          endDateId="endDateId"
          onDatesChange={ ({ startDate, endDate }) => {
            onDateChange(startDate, endDate);
          }}
          initialVisibleMonth={() => moment().subtract(1, 'months')}
          isOutsideRange={(day) => day.isAfter(moment())}
          focusedInput={this.state.focusedInput}
          onFocusChange={focusedInput => {
            this.setState({ focusedInput })
          }}
        />
      </DatePickerContainer>
    );
  };
}

