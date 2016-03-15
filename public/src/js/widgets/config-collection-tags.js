import BaseWidget from 'widgets/base-widget';
import $ from 'jquery';
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

        var initialValues = _.map(tags, tag => {
            return{
              'text': tag.type,
              'value': tag.type

            };
        });

        $('.multipleInputDynamic').attr('data-initial-value', JSON.stringify(initialValues));
        $('.multipleInputDynamic').fastselect({
            parseData: function(data) {
                var parsedData = data.reduce(function(parsed, data) {
                    parsed.push( {
                        'text': data.type,
                        'value': data.type
                    });
                    return parsed;
                }, []);
                return parsedData;
            }
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
