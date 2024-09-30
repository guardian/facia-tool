import React, { useRef, useEffect, useState } from 'react';
import { styled, theme } from 'constants/theme';
import { EditorView } from 'prosemirror-view';
import 'prosemirror-menu/style/menu.css';
import { createEditorView } from './richtext/setup';
import { MenuView } from './richtext/MenuView';
import { WrappedFieldInputProps } from 'redux-form';
import InputLabel from 'components/inputs/InputLabel';

const InputWrapper = styled.div`
	position: relative;
	width: ${({ width }: { width?: number }) => width || 'auto'};
	display: flex;
	flex-direction: column;
	border: ${`solid 1px ${theme.input.borderColor}`};
	background: ${theme.input.backgroundColor};
	padding: 3px 5px;
	font-size: 14px;
	outline: none;
	.ProseMirror {
		outline: none;
		min-height: 90px;
	}
	p {
		margin: 7px 0;
	}
`;

const TextInputLabel = styled(InputLabel)`
	display: ${(props) => (props.hidden ? 'none' : 'flex')};
	align-items: flex-end;
`;

interface RichTextInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	input: WrappedFieldInputProps;
	label?: string;
}

const RichTextInput = ({ ...props }: RichTextInputProps) => {
	const editorEl = useRef<HTMLDivElement>(null);
	const [editorView, setEditorView] = useState<EditorView | undefined>(
		undefined,
	);

	useEffect(() => {
		if (!props.input.value) {
			return;
		}
		// Editor view takes an HTML Node therefore this string value needs to be converted into a node by placing in a div
		const contentNode = document.createElement('div');
		contentNode.innerHTML = props.input.value;
		const edView = createEditorView(props.input, editorEl, contentNode);
		setEditorView(edView);
	}, []);

	const { label } = props;

	return (
		<>
			{label && (
				<TextInputLabel htmlFor={label}>
					<span>{label}</span>
				</TextInputLabel>
			)}
			<InputWrapper>
				{editorView && <MenuView edView={editorView} />}
				<div
					id="editor"
					className="ProseMirror-example-setup-style"
					ref={editorEl}
					data-testid="edit-form-rich-text"
				/>
			</InputWrapper>
		</>
	);
};

export { RichTextInput };
