import { buildKeymap } from './utils/keymap';
import { keymap } from 'prosemirror-keymap';
import { Schema, DOMSerializer, DOMParser } from 'prosemirror-model';
import { schema, nodes } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { EditorView } from 'prosemirror-view';
import { EditorState, Transaction } from 'prosemirror-state';
import OrderedMap from 'orderedmap';
import { history } from 'prosemirror-history';
import { inputRules, InputRule } from "prosemirror-inputrules";
import { onKeyPressRules } from './cleanerRules';

export const guInputRules = onKeyPressRules.map(({ match, replace }) =>
    new InputRule(match, replace)
);

const createBasePlugins = (s: Schema) => {
  const plugins = [
    keymap(buildKeymap(s, {}, {})),
    history({ depth: 100, newGroupDelay: 500 }),
    inputRules({ rules: guInputRules })
  ];
  return plugins;
};

const nodeMap = OrderedMap.from({
  doc: {
    content: '(text | hard_break)+',
  },
  text: nodes.text,
  hard_break: nodes.hard_break,
});

export const basicSchema = new Schema({
  nodes: addListNodes(nodeMap, 'doc *'),
  marks: schema.spec.marks,
});

export const createEditorView = (
  onChange: (newState: string) => void,
  editorEl: HTMLDivElement,
  contentEl: HTMLDivElement
) => {
  const ed: EditorView = new EditorView(editorEl, {
    state: EditorState.create({
      doc: DOMParser.fromSchema(basicSchema).parse(contentEl),
      plugins: createBasePlugins(basicSchema),
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
        onChange(tmp.innerHTML);
      }
    },
  });
  return ed;
};
