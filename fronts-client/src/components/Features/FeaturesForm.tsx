import React from 'react';
import InputCheckboxToggle from 'components/inputs/InputCheckboxToggle';
import { connect } from 'react-redux';
import type { State } from 'types/State';
import { selectAllFeatures } from 'selectors/featureSwitchesSelectors';
import { FeatureSwitch } from 'types/Features';
import { Dispatch } from 'types/Store';
import { actionSetFeatureValue } from 'actions/FeatureSwitches';
import { saveFeatureSwitch } from 'services/userDataApi';

interface Props {
	featureSwitches: FeatureSwitch[];
	setFeatureValue: (featureSwitch: FeatureSwitch) => void;
}

class FeaturesForm extends React.Component<Props> {
	public render() {
		const { featureSwitches } = this.props;
		console.log(featureSwitches);
		return (
			<form>
				{featureSwitches.map((featureSwitch) => (
					<InputCheckboxToggle
						key={featureSwitch.key}
						label={featureSwitch.title}
						id={featureSwitch.key}
						input={{
							onChange: () => this.handleChange(featureSwitch),
							checked: featureSwitch.enabled,
						}}
					/>
				))}
			</form>
		);
	}

	private handleChange(featureSwitch: FeatureSwitch) {
		const newFeatureSwitch = {
			...featureSwitch,
			enabled: !featureSwitch.enabled,
		};
		this.props.setFeatureValue(newFeatureSwitch);
		saveFeatureSwitch(newFeatureSwitch);
	}
}

const getState = (state: any) => state;

const mapStateToProps = (state: State) => ({
	featureSwitches: selectAllFeatures(getState(state)),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
	setFeatureValue: (featureSwitch: FeatureSwitch) =>
		dispatch(actionSetFeatureValue(featureSwitch)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FeaturesForm);
