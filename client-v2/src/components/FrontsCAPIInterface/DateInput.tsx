import React from 'react';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import moment from 'moment';

interface CAPIDateInputProps {
  start: moment.Moment | null
  end: moment.Moment | null
  onDateChange: (startDate: moment.Moment, endDate: moment.Moment) => void
}

interface CAPIDateInputState {
  focusedInput: 'startDate' | 'endDate' | null
}


export default class CAPIDateRangeInput extends React.Component<CAPIDateInputProps, CAPIDateInputState> {

  public state = {
    focusedInput: 'startDate'
  };

  public render() {

    const { start, end, onDateChange } = this.props;

    return (
      <div>
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
        isOutsideRange={(day) => day.isAfter(moment())}
        focusedInput={this.state.focusedInput}
        onFocusChange={focusedInput => {
          this.setState({ focusedInput: focusedInput || 'startDate' })
        }}
      />
      </div>
    );
  };
}

