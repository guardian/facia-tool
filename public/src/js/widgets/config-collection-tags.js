import BaseWidget from 'widgets/base-widget';
import ko from 'knockout';
import _ from 'underscore';
import 'fastsearch';
import 'fastselect';

export default class CollectionTags extends BaseWidget {
    constructor(params) {
        super();

        this.tags = params.tags;
        const tags = params.tags();

        var initialInput = _.pluck(tags, 'type').join(',');

        this.inputTags = ko.observable(initialInput);

        this.initialValues = _.map(tags, tag => {
            return{
              'text': tag.type,
              'value': tag.type

            };
        });

        this.subscribeOn(this.inputTags, this.updateTags);

    };

    updateTags(tags) {
        var tagObjects = tags.split(',').reduce((tags, tag) => {
            if (tag !== '') {
                tags.push({ type: tag });
            }
            return tags;
        }, []);

        this.tags(tagObjects);
    };
}
