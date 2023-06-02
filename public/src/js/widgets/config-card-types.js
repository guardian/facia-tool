import ko from 'knockout';
import _ from 'underscore';
import * as vars from '../modules/vars';
import Extension from '../models/extension';

export default class extends Extension {
    constructor(baseModel) {
        var types;

        super(baseModel);

        if (baseModel.priority === 'email') {
            types = vars.CONST.emailTypes;
        } else {
            types = vars.CONST.types;
        }

        baseModel.types = ko.observableArray(_.pluck(types, 'name'));
        var groups = {};
        _.each(types, type => {
            groups[type.name] = type.groups;
        });
        baseModel.typesGroups = groups;
    }
}
