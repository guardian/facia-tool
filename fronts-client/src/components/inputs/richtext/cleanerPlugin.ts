import { AllSelection, EditorState, Transaction } from 'prosemirror-state';
import { Fragment, Node, NodeType, Schema } from 'prosemirror-model';
import { onCleanupRules } from './cleanerRules';

type NodesToRemoveSpec = { from: number; to: number };
type PrevNodeSpec = { node: Node; pos: number };
type NodeTypeSpec = {
  type: NodeType;
  predicate: (n: Node, prevNodes: PrevNodeSpec[], end: boolean) => boolean;
};

export const findChildrenToRemove = (
  parent: Node,
  nodeTypeSpecs: NodeTypeSpec[] = [],
  offset = 0
) => {
  let nodesToRemove: NodesToRemoveSpec[] = [];
  let prevNodes: PrevNodeSpec[] = [];

  const shouldRemoveNode = (
    node: Node,
    prevNodes: PrevNodeSpec[],
    atEnd: boolean
  ) => {
    const nodeTypeSpec = nodeTypeSpecs.find(({ type }) => type === node.type);
    return nodeTypeSpec && nodeTypeSpec.predicate(node, prevNodes, atEnd);
  };

  const removeNode = (node: Node, pos: number) => {
    nodesToRemove = nodesToRemove.concat({
      from: pos,
      to: pos + node.nodeSize,
    });
  };

  const retryRemovingLastNodes = () => {
    for (;;) {
      const lastNode = prevNodes.pop();
      if (!lastNode) {
        break;
      }
      const shouldRemove =
        lastNode && shouldRemoveNode(lastNode.node, prevNodes, true);
      if (!shouldRemove) {
        break;
      }
      removeNode(lastNode.node, lastNode.pos + offset);
    }
  };

  // if I could reduce over this I wouldn't need so much mutable state here!
  // but this is a ProseMirror forEach, and not an Array
  parent.forEach((node, pos, i) => {
    const atEnd = parent.childCount - 1 === i;
    if (shouldRemoveNode(node, prevNodes, atEnd)) {
      removeNode(node, pos + offset);

      // if we're at the end, go back through the nodes to check whether
      // passing `atEnd` will then delete the node if not then break
      if (atEnd) {
        retryRemovingLastNodes();
      }
    } else {
      if (!node.isLeaf) {
        nodesToRemove = nodesToRemove.concat(
          findChildrenToRemove(node, nodeTypeSpecs, pos + offset + 1)
        );
      }
      prevNodes.push({ node, pos });
    }
  });

  return nodesToRemove;
};

const deleteNodes = (emptyNodePositions: NodesToRemoveSpec[]) => (
  tr: Transaction
) => {
  emptyNodePositions.forEach(({ from, to }) => {
    const _from = tr.mapping.mapResult(from).pos;
    const _to = tr.mapping.mapResult(to).pos;
    tr.delete(_from, _to);
  });
  return tr;
};

const stringHandler = (string: string) => (
  tr: Transaction,
  match: string[],
  start: number,
  end: number,
  schema: Schema
) => {
  let insert = string;
  // if we have a match group then adjust the indices accordingly
  if (match[1]) {
    const offset = match[0].lastIndexOf(match[1]);
    insert += match[0].slice(offset + match[1].length);
    start += offset;
    const cutOff = start - end;

    if (cutOff > 0) {
      insert = match[0].slice(offset - cutOff, offset) + insert;
      start = end;
    }
  }

  const marks = tr.doc.resolve(start).marks();
  return tr.replaceWith(
    start,
    end,
    insert ? schema.text(insert, marks) : Fragment.empty
  );
};
const applyCleanupRules = (doc: Node, schema: Schema) => (_tr: Transaction) => {
  const { from, to } = new AllSelection(doc);

  let tr = _tr;

  doc.nodesBetween(from, to, (node, pos) => {
    // check across the whole inline
    if (node.isText) {
      onCleanupRules.forEach((rule) => {
        let match;
        while (node.text && (match = rule.match.exec(node.text))) {
          const start = tr.mapping.map(pos + match.index);
          const end = start + match[0].length;
          tr = stringHandler(rule.replace)(tr, match, start, end, schema);
        }
      });
    }
  });

  return tr;
};

// Takes prosemirror content, loops through and applies all defined rules to it
const cleanUpContent = <T extends Schema<any, any>>(
  state: EditorState<T>,
  dispatch: (tr: Transaction) => void
) => {
  const childrenToRemove = findChildrenToRemove(state.doc, [
    {
      // rRmove all pars that don't have text
      type: state.schema.nodes.paragraph,
      predicate: (node) => !node.textContent || !node.textContent.trim(),
    },
    {
      // For hardbreaks if there are two hard breaks before it, or it's at
      // the end of a parent node, remove it
      type: state.schema.nodes.hard_break,
      predicate: (node, prevNodes, end) =>
        end ||
        prevNodes
          .slice(-2)
          .every(({ node: prevNode }) => prevNode.type === node.type),
    },
  ]);
  const tr = deleteNodes(childrenToRemove)(
    // TODO: Could we do the same as the paste rules here and check for HTML
    // so that cleanup wouldn't replace curly quotes?
    applyCleanupRules(state.doc, state.schema)(state.tr)
  );
  return dispatch ? dispatch(tr) : true;
};

export { cleanUpContent };
