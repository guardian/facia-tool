import ko from 'knockout';
import _ from 'underscore';
import * as vars from 'modules/vars';
import Extension from 'models/extension';
import observableNumeric from '../utils/observable-numeric';

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
        const typesGroups = {};
        const typesGroupsConfig = {};
        _.each(types, type => {
            typesGroups[type.name] = type.groups;
            typesGroupsConfig[type.name] = type.groupsConfig !== undefined && Array.isArray(type.groupsConfig)
                ? ko.observableArray(
                    type.groupsConfig.map((groupConfig) => {
                      return {
                        name: groupConfig.name,
                        maxItems: observableNumeric(groupConfig.maxItems)
                      };
                    })
                ) : undefined;
        });
        baseModel.typesGroups = typesGroups;
        baseModel.typesGroupsConfig = typesGroupsConfig;
    }
}
