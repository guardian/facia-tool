import React from 'react';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { DateRangePicker } from 'react-dates';
import { styled, theme } from 'constants/theme';
import moment from 'moment';

interface CAPIDateInputProps {
	start: moment.Moment | null;
	end: moment.Moment | null;
	onDateChange: (
		startDate: moment.Moment | null,
		endDate: moment.Moment | null,
	) => void;
}

interface CAPIDateInputState {
	focusedInput: 'startDate' | 'endDate' | null;
}

const DatePickerContainer = styled.div`
	padding-top: 20px;
	padding-left: 2px;
	font-size: 14px;
`;

const SearchTitle = styled.div`
	font-weight: bold;
	margin-right: 3px;
	margin-bottom: 7px;
`;

const DatePicker = styled.div`
	.DateInput_input {
		font-size: 14px;
		line-height: 14px;
		font-family: TS3TextSans;
		color: ${theme.capiInterface.text};
	}

	.DateRangePickerInput__withBorder {
		border: ${`1px solid ${theme.capiInterface.borderLight}`};
	}

	.CalendarMonth_caption {
		color: ${theme.capiInterface.text};
		font-family: TS3TextSans;
	}

	.CalendarDay__selected {
		background: ${theme.capiInterface.backgroundSelected};
		border: ${`1px double ${theme.capiInterface.border}`};
		color: ${theme.capiInterface.text};
	}

	.CalendarDay__selected_span {
		background: ${theme.capiInterface.backgroundDark};
		border: ${`1px double ${theme.capiInterface.border}`};
		color: ${theme.capiInterface.text};
	}

	.CalendarDay__hovered_span,
	.CalendarDay__hovered_span:hover {
		background: ${theme.capiInterface.backgroundLight};
		border: ${`1px double ${theme.capiInterface.border}`};
		color: ${theme.capiInterface.text};
	}

	.CalendarDay__selected:hover,
	.CalendarDay__selected_span:hover {
		background: ${theme.capiInterface.backgroundDark};
		border: ${`1px double ${theme.capiInterface.border}`};
		color: ${theme.capiInterface.text};
	}
`;

export default class CAPIDateRangeInput extends React.Component<
	CAPIDateInputProps,
	CAPIDateInputState
> {
	public state = {
		focusedInput: null,
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
						isOutsideRange={(day) => day.isAfter(moment())}
						focusedInput={this.state.focusedInput}
						onFocusChange={(focusedInput) => {
							this.setState({ focusedInput });
						}}
					/>
				</DatePicker>
			</DatePickerContainer>
		);
	}
}
