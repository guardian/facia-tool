import { buildKeymap } from './keymap';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { Schema, DOMSerializer, DOMParser, NodeSpec } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { EditorView } from 'prosemirror-view';
import { EditorState, Transaction } from 'prosemirror-state';
import { RefObject } from 'react';
import { WrappedFieldInputProps } from 'redux-form';
import OrderedMap from 'orderedmap';
import { history } from 'prosemirror-history';

const createBasePlugins = (s: Schema) => {
  const plugins = [
    keymap(buildKeymap(s, {}, {})),
    keymap(baseKeymap),
    history({ depth: 100, newGroupDelay: 500 })
  ];
  return plugins;
};

export const basicSchema = new Schema({
  nodes: addListNodes(
    schema.spec.nodes as OrderedMap<NodeSpec>,
    'paragraph block*',
    'block'
  ),
  marks: schema.spec.marks
});

export const createEditorView = (
  input: WrappedFieldInputProps,
  editorEl: RefObject<HTMLDivElement>,
  contentEl: HTMLDivElement
) => {
  if (!editorEl.current) {
    return;
  }
  const ed: EditorView = new EditorView(editorEl.current, {
    state: EditorState.create({
      doc: DOMParser.fromSchema(basicSchema).parse(contentEl),
      plugins: createBasePlugins(basicSchema)
    }),
    dispatchTransaction: (transaction: Transaction) => {
      const { state, transactions } = ed.state.applyTransaction(transaction);
      ed.updateState(state);

      if (transactions.some((tr: Transaction) => tr.docChanged)) {
        const serializer = DOMSerializer.fromSchema(basicSchema);
        const outputHtml = serializer.serializeFragment(state.doc.content);
        // to format the outputHtml as an html string rather than a document fragment, we are creating a temporary div, adding it as a child, then using innerHTML which returns an html string
        const tmp = document.createElement('div');
        tmp.appendChild(outputHtml);
        if (input.onChange) {
          input.onChange(tmp.innerHTML);
        }
      }
    }
  });
  return ed;
};
