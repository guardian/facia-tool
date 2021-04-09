import { Fragment, Node, Slice } from 'prosemirror-model';
import { Rule } from './cleanerRules';

type NodeCleaner = (node: Node, text?: string) => Node;
type StringCleaner = (text: string) => String;

const cleanNodes = (cleaner: NodeCleaner) => (prevFrag: Fragment) => {
    let frag = Fragment.empty;

    const appendNodeToFragment = (node: Node) =>
        (frag = frag.append(Fragment.from(node)));

    let prevText = '';

    prevFrag.forEach(node => {
        const node1 = cleaner(node, prevText);

        if (!node1) {
            return;
        }

        const node2 = node1.copy(cleanNodes(cleaner)(node1.content));

        appendNodeToFragment(node2);

        // accumulate the previous text until we hit a node that is not a
        // text node
        prevText = node.isText ? prevText + node.textContent : '';
    });

    return frag;
};

const replaceFirstMatchGroupWith = (replace: string) => (substr: string, match: string) => {
    const offset = substr.lastIndexOf(match);
    const pre = substr.slice(0, offset);
    const post = substr.slice(offset + match.length);
    return `${pre}${replace}${post}`;
};

const runRules = (rules: Rule[]) => (text: string) => rules.reduce(
        (str, { match, replace }) =>
            str.replace(match, replaceFirstMatchGroupWith(replace)),
        text
    );

// this takes every string from a textNode and the previous text content of the
// text node's parent element and uses this previous text to work out whether
// we're in HTML text (which could be split acoss many text nodes)
const cleanStrings = (cleaner: StringCleaner): NodeCleaner => (node, prev = "") => {
    if (!node.isText) {
        return node;
    }
    // This takes all the parent node's previous text content and adds it to
    // the current textNode's text and then splits it into HTML tokens so that
    // we know whether this textNode contains text that looks like it is HTML
    // content or if it's just normal content
    const tokens = `${prev}${node.text}`.split(
        /(<[^>]+?$|>(?:$|.*<\/[^>]+?>)?)/
    );

    // this makes sure we don't clean an HTML token and that we don't touch
    // stuff content that appeared in `prev` i.e. in a previous text node
    // as these tokens may overlap previous text nodes
    const getCleaned = (token: string, startPos: number) => {
        const isInHTML = /^\s*<|>$/.test(token);
        const offset = prev.length - startPos;
        const editable = token.slice(offset < 0 ? 0 : offset, token.length);
        return isInHTML ? editable : cleaner(editable);
    };

    // We loop through each of the tokens and work out whether this token
    // is in an HTML tag or not if so we edit the part of it that was in the
    // text node we were passed
    const { nextStr } = tokens.reduce(
        ({ nextStr, startPos }, token) => {
            const endPos = startPos + token.length;
            return {
                nextStr:
                    endPos >= prev.length
                        ? nextStr + getCleaned(token, startPos)
                        : nextStr,
                startPos: endPos
            };
        },
        { nextStr: '', startPos: 0 }
    );

    return node.type.schema.text(nextStr, node.marks);
};

const createStringCleaner = (rules: Rule[]) => cleanNodes(cleanStrings(runRules(rules)));

const cleanupSlice = (cleaner: NodeCleaner) => (slice: Slice) =>
    new Slice(
        cleaner(slice.content),
        slice.openStart,
        slice.openEnd
    );

const UNICODE_CONTROL_CHARACTERS = /[\u0000-\u001F]/g;

/**
 * @param {string} value
 * @returns {string}
 */
const stripInvalidCharacters = (value: string) => {
    return value.replace(UNICODE_CONTROL_CHARACTERS, '')
}

export { cleanupSlice, createStringCleaner, runRules, stripInvalidCharacters };
