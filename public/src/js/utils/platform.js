import CONST from '../constants/defaults';

function isPlatformSpecificCollection(platform) {
    return platform === CONST.platforms.app || platform === CONST.platforms.web;
}

export default isPlatformSpecificCollection;
