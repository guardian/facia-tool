import ko from 'knockout';
import Extension from '../models/extension';
import {CONST} from '../modules/vars';

export default class extends Extension {
    constructor(baseModel) {
        super(baseModel);

        baseModel.navSections = ko.observableArray(CONST.navSections);
    }
}
