import * as vars from 'modules/vars';

var originalValues = {
    imageCdnDomainExpr: '',
    imgIXDomainExpr: '',
    staticImageCdnDomain: '',
    imageCdnDomain: ''
};
var overrides = {
    imageCdnDomainExpr: new RegExp('http://' + window.location.host),
    imgIXDomainExpr: /http:\/\/imgix\//,
    staticImageCdnDomain: 'http://' + window.location.host + '/base/test/public/fixtures/',
    imageCdnDomain: window.location.host
};

function setup () {
    Object.keys(originalValues).forEach(key => {
        originalValues[key] = vars.CONST[key];
        vars.CONST[key] = overrides[key];
    });
}

function dispose () {
    Object.keys(originalValues).forEach(key => {
        vars.CONST[key] = originalValues[key];
    });
}

function path (image) {
    return 'http://' + window.location.host + '/base/test/public/fixtures/' + image;
}

function imgIX (image) {
    return 'http://imgix/' + image;
}

export default {setup, dispose, path, imgIX};
