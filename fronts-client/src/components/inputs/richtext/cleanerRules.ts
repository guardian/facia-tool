export const addFlag = (flag: string) => ({ source, flags }: { source: string, flags: string }) => {
  const newFlags = flags.includes(flag) ? flags : `${flags}${flag}`;
  return new RegExp(source, newFlags);
};

export const globalify = addFlag("g");

export const dollarify = (re: RegExp) => {
    const newPattern = re.source.replace(/([^$])$/, "$1$");
    return new RegExp(newPattern, re.flags);
};

// All of these rules should aim to be replacing the last character(s) in the
// regex this means that InputRules works nicely
// should also only return one match - any bracketed exporessions other than
// the match should be a non-capturing group
export interface Rule {
    match: RegExp;
    replace: string;
    trigger: {
        onKeyPress: boolean;
        onCleanup: boolean;
        onPaste: boolean;
        onInit: boolean;
    };
}

type TriggerName = keyof Rule["trigger"];

const ruleset: Rule[] = [
    {
        match: /( - | -- )/,
        replace: " – ",
        trigger: {
            onKeyPress: true,
            onCleanup: true,
            onPaste: false,
            onInit: false,
        },
    },
    {
        match: /—/,
        replace: "–",
        trigger: {
            onKeyPress: true,
            onCleanup: true,
            onPaste: false,
            onInit: false,
        },
    },
    {
        match: /(\&shy;|­|&#173;)/,
        replace: "",
        trigger: {
            onKeyPress: true,
            onCleanup: true,
            onPaste: false,
            onInit: false,
        },
    },
    {
        match: /(?:^|[\s()])(?:['"\u2019\u201D\u2018\u201C]*)(")/,
        replace: "“",
        trigger: {
            onKeyPress: true,
            onCleanup: true,
            onPaste: true,
            onInit: true,
        },
    },
    {
        match: /[^\s()](?:['"\u2019\u201D\u2018\u201C]*)(")/,
        replace: "”",
        trigger: {
            onKeyPress: true,
            onCleanup: true,
            onPaste: true,
            onInit: true,
        },
    },
    {
        match: /(?:^|[\s()])(?:['"\u2019\u201D\u2018\u201C]*)(')/,
        replace: "‘",
        trigger: {
            onKeyPress: true,
            onCleanup: true,
            onPaste: true,
            onInit: true,
        },
    },
    {
        match: /[^\s()](?:['"\u2019\u201D\u2018\u201C]*)(')/,
        replace: "’",
        trigger: {
            onKeyPress: true,
            onCleanup: true,
            onPaste: true,
            onInit: true,
        },
    },
    {
        match: /(\.\.\.)/,
        replace: "…",
        trigger: {
            onKeyPress: true,
            onCleanup: true,
            onPaste: false,
            onInit: false,
        },
    },
    {
        match: /\s(\s+)/,
        replace: "",
        trigger: {
            onKeyPress: false,
            onCleanup: true,
            onPaste: true,
            onInit: false,
        },
    },
    {
        // Prefer that users cannot add non-breaking spaces,
        // but do not strip them from existing documents.
        match: /(\u202F|\u00A0)/,
        replace: " ",
        trigger: {
            onKeyPress: false,
            onCleanup: true,
            onPaste: true,
            onInit: false,
        },
    },
];

const filterTrigger = (rules: Rule[], triggerName: TriggerName) =>
    rules.filter(({ trigger }) => trigger[triggerName]);

const onKeyPressRules = filterTrigger(ruleset, "onKeyPress").map((rule) =>
    Object.assign({}, rule, {
        match: dollarify(rule.match),
    })
);

const onCleanupRules = filterTrigger(ruleset, "onCleanup").map((rule) =>
    Object.assign({}, rule, {
        match: globalify(rule.match),
    })
);

const onPasteRules = filterTrigger(ruleset, "onPaste").map((rule) =>
    Object.assign({}, rule, {
        match: globalify(rule.match),
    })
);

const onInitRules = filterTrigger(ruleset, "onInit").map((rule) =>
    Object.assign({}, rule, {
        match: globalify(rule.match),
    })
);

export { onKeyPressRules, onCleanupRules, onPasteRules, onInitRules };
