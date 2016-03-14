export default function (jsonString) {
    const errors = [];

    return {
        json: tryParsingString(jsonString, errors),
        errors: errors
    };
}

function tryParsingString (jsonString, errors) {
    try {
        return JSON.parse(jsonString);
    } catch (ex) {
        return reportUnexpectedToken(jsonString, ex.message, errors);
    }
}

function reportUnexpectedToken (jsonString, error, listOfErrors) {
    const match = error.match(/^unexpected token (.*)/i);
    if (match) {
        const parts = jsonString.split(match[1]);
        const firstQuote = parts[0].lastIndexOf('"');
        const lastQuote = parts[1].indexOf('"');
        const firstPart = parts[0].substring(firstQuote + 1);
        const secondPart = parts[1].substring(0, lastQuote);

        const invalidString = firstPart + secondPart;
        const sourceMatch = parts[0].substring(0, firstQuote).match(/"([^"]+)"\s?:\s?$/);
        const source = sourceMatch ? sourceMatch[1] : 'symbol';
        listOfErrors.push('Invalid ' + source + ' in \'' + invalidString + '\' between \'' + firstPart + '\' and \'' + secondPart + '\'');
        return tryParsingString(parts.join(''), listOfErrors);
    } else {
        listOfErrors.push(error);
    }
}
