import React from 'react';
import { styled, Theme } from 'constants/theme';
import { SingleDatePicker } from 'react-dates';
import { Moment } from 'moment';

interface ManageEditionProps {}

interface ManageEditionState {
  date: Moment | null;
  isDatePickerOpen: boolean;
}

class ManageEdition extends React.Component<
  ManageEditionProps,
  ManageEditionState
> {
  public state = {
    date: null,
    isDatePickerOpen: false
  };

  constructor(props: ManageEditionProps) {
    super(props);
  }

  public render() {
    return (
      <>
        <h2>Pick a date</h2>
        <SingleDatePicker
          date={null}
          onDateChange={this.handleDateChange}
          focused={this.state.isDatePickerOpen}
          onFocusChange={this.handleFocusChange}
          id="editions-date"
        />
      </>
    );
  }

  private handleDateChange = (date: Moment | null) => this.setState({ date });

  private handleFocusChange = (isFocussedObj: { focused: boolean | null }) =>
    this.setState({ isDatePickerOpen: !!isFocussedObj.focused });
}

export default ManageEdition;
