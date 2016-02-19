import BaseWidget from 'widgets/base-widget';
import $ from 'jquery';
import ko from 'knockout';
import _ from 'underscore';
import fastsearch from 'fastsearch';
import fastselect from 'fastselect';

export default class CollectionTags extends BaseWidget {
    constructor(params) {
        super();

        this.tags = params.tags;
        var tags = params.tags();

        var initialInput = _.reduce(tags, (initialInput, tag, index) => {
            initialInput += tag.type;

            if (index !== tags.length - 1) {
                initialInput += ',';
            }

            return initialInput;
        }, '');

        this.inputTags = ko.observable(initialInput);

        var initialValues = _.map(tags, tag => {
            return{
              'text': tag.type,
              'value': tag.type

            };
        });

        $('.multipleInputDynamic').attr('data-initial-value', JSON.stringify(initialValues));
        $('.multipleInputDynamic').fastselect();

        this.subscribeOn(this.inputTags, this.updateTags);

    };

    updateTags(tags) {
        var tagObjects = tags.split(',').reduce((tags, tag) => {
            if (tag !== '') {
                tags.push({ type: tag});
            }
            return tags;
        }, []);

        this.tags(tagObjects);
    };
}
