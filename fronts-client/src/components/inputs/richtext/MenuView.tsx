import { EditorView } from 'prosemirror-view';
import { toggleMark } from 'prosemirror-commands';
import React from 'react';
import { styled, theme } from 'constants/theme';
import { basicSchema } from './setup';
import { icons } from './icons';
import {
	linkItemCommand,
	removeAllMarksFromSelection,
	unlinkItemCommand,
} from './utils/command-helpers';
import { EditorState, Transaction } from 'prosemirror-state';
import { undo, redo } from 'prosemirror-history';

const MenuViewWrapper = styled.div`
	display: flex;
	flex-direction: row;
	margin-top: -4px;
	margin-left: -5px;
`;

const MenuButton = styled.div`
	width: 30px;
	height: 25px;
	padding: 4px;
	background: transparent;
	text-align: center;
	border: 1px solid black;
	background-color: ${theme.colors.whiteDark};
	:hover {
		background-color: ${theme.colors.greyLight};
		cursor: pointer;
	}
	svg {
		height: 100%;
		fill: ${theme.colors.blackDark};
	}
`;

export const MenuView = ({ edView }: { edView: EditorView }) => {
	const linkEl = document.createElement('i');
	linkEl.innerHTML = icons.link;

	const menuItems = [
		{
			command: toggleMark(basicSchema.marks.strong),
			dom: icons.strong,
			title: 'bold',
		},
		{
			command: toggleMark(basicSchema.marks.em),
			dom: icons.emphasis,
			title: 'italic',
		},
		{
			command: linkItemCommand(basicSchema.marks.link)(),
			dom: icons.link,
			title: 'add-link',
		},
		{
			command: unlinkItemCommand(basicSchema.marks.link),
			dom: icons.unlink,
			title: 'remove-link',
		},
		{
			command: undo,
			dom: icons.undo,
			title: 'undo',
		},
		{
			command: redo,
			dom: icons.redo,
			title: 'redo',
		},
		{
			command: (state: EditorState, dispatch: (tr: Transaction) => void) =>
				removeAllMarksFromSelection(state, dispatch),
			dom: icons.removeFormatting,
			title: 'remove-formatting',
		},
	];

	return (
		<MenuViewWrapper className="menubar">
			{menuItems.map((item, i) => {
				return (
					<MenuButton
						className="iconBox"
						onMouseDown={(e: React.MouseEvent) => {
							e.preventDefault();
							item.command(edView.state, edView.dispatch);
						}}
						key={i}
						data-testid={item.title}
						dangerouslySetInnerHTML={{ __html: item.dom }}
					/>
				);
			})}
		</MenuViewWrapper>
	);
};
