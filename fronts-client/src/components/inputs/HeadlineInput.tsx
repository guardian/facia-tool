import React from 'react';
import { Field } from 'redux-form';
import { RichTextInput } from './RichTextInput';
import InputTextArea from './InputTextArea';
import InputCheckboxToggleInline from './InputCheckboxToggleInline';
import ConditionalField from './ConditionalField';
import styled from 'styled-components';
import pageConfig from '../../util/extractConfigFromPage';

interface HeadlineInputProps {
	abTestEnabled: boolean;
	capiHeadline: string;
	cardId: string;
	editableFields: string[];
	snapType: string | undefined;
}

const HeadlineInputContainer = styled('div')<{ abTestEnabled: boolean }>`
	background-color: ${({ abTestEnabled }) =>
		abTestEnabled ? 'white' : 'transparent'};
	border-radius: 4px;
	padding: ${({ abTestEnabled }) => (abTestEnabled ? '20px' : '0px')};
	position: relative;
	margin-bottom: 10px;
`;

const ABTestToggleContainer = styled('div')<{ abTestEnabled: boolean }>`
	position: absolute;
	right: ${({ abTestEnabled }) => (abTestEnabled ? '20px' : '0px')};
`;

const HeadlineVariantContainer = styled('div')`
	display: flex;
	flex-direction: column;
	gap: 18px;
`;

const HeadlineInput = ({ ...props }: HeadlineInputProps) => {
	/**
	 * You may be thinking -- why on earth would we use the `headline` field to contain
	 * HTML, renaming it in the process so our users are none the wiser? It's because the e-mail
	 * frontend, which currently consumes snaps of this type, knows what to do with headlines
	 * (it renders them as HTML). At some point in the future, it will be refactored, at which
	 * point we'll be able to use another, saner field to do the same job, but in the meantime,
	 * for snaps of type `html`, the field `headline` is where the html lives.
	 */
	const getHeadlineLabel = () =>
		props.snapType === 'html' ? 'Content' : 'Headline';

	const getInputId = (cardId: string, label: string) => `${cardId}-${label}`;

	const headlineABTestingFeatureSwitch =
		pageConfig?.userData?.featureSwitches.find(
			(feature) => feature.key === 'headline-ab-testing',
		);

	return (
		<HeadlineInputContainer
			abTestEnabled={
				props.abTestEnabled && headlineABTestingFeatureSwitch?.enabled === true
			}
		>
			{props.cardId && headlineABTestingFeatureSwitch?.enabled === true && (
				<ABTestToggleContainer abTestEnabled={props.abTestEnabled}>
					<Field
						name="abTestEnabled"
						component={InputCheckboxToggleInline}
						label="Headline test"
						id={getInputId(props.cardId, 'ab-test-enabled')}
						type="checkbox"
						data-testid="edit-form-ab-test-toggle"
					/>
				</ABTestToggleContainer>
			)}

			{props.abTestEnabled &&
			headlineABTestingFeatureSwitch?.enabled === true ? (
				<HeadlineVariantContainer>
					<ConditionalField
						permittedFields={props.editableFields}
						name="headlineA"
						label="Headline A"
						rows="2"
						component={InputTextArea}
						data-testid="edit-form-headline-a-field"
					/>
					<ConditionalField
						permittedFields={props.editableFields}
						name="headlineB"
						label="Headline B"
						rows="2"
						component={InputTextArea}
						data-testid="edit-form-headline-b-field"
					/>
				</HeadlineVariantContainer>
			) : (
				<Field
					name="headline"
					label={getHeadlineLabel()}
					rows="2"
					placeholder={props.capiHeadline}
					component={props.snapType === 'html' ? RichTextInput : InputTextArea}
					originalValue={props.capiHeadline}
					data-testid="edit-form-headline-field"
				/>
			)}
		</HeadlineInputContainer>
	);
};

export { HeadlineInput };
