import { Rule } from './cleanerRules';

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

export { runRules };
