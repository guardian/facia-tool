import ko from 'knockout';
import $ from 'jquery';
import _ from 'underscore';
import mediator from 'utils/mediator';
import articleCollection from 'utils/article-collection';

ko.bindingHandlers.toggleClick = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();

        ko.utils.registerEventHandler(element, 'click', function () {
            value(!value());
        });
    }
};

ko.bindingHandlers.slideVisible = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();
        $(element).toggle(ko.unwrap(value));
    },
    update: function (element, valueAccessor) {
        var value = ko.unwrap(valueAccessor());
        if (value) { $(element).slideDown(200); } else { $(element).slideUp(200); }
    }
};

ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
        var value = valueAccessor();
        $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function(element, valueAccessor) {
        var value = valueAccessor();
        if (ko.unwrap(value)) { $(element).fadeIn(); } else { $(element).fadeOut(); }
    }
};

ko.bindingHandlers.tagSelector = {
    init: function(element, valueAccessor, allBindings, CollectionTags) {
        var selector = $(element).find('.multipleInputDynamic');
        selector.attr('data-initial-value', JSON.stringify(CollectionTags.initialValues));
        selector.fastselect({
            parseData: function(data) {
                var parsedData = data.reduce(function(parsed, data) {
                    parsed.push( {
                        'text': data.type,
                        'value': data.type
                    });
                    return parsed;
                }, []);
				// The primary tag is the default for specific containers (e.g. scrollable/small).
				// Because of this, we don't want it as an option in the dropdown menu.
				const parsedDataWithoutPrimaryTag = parsedData.filter(item => item.text !== 'Primary');
				return parsedDataWithoutPrimaryTag;
            }
        });
    }
};

function mod(n, m) {
    return ((n % m) + m) % m;
}

function resize(el) {
    setTimeout(function() {
        el.style.height = (el.scrollHeight) + 'px';
    });
}

ko.bindingHandlers.autoResize = {
    init: function(el) {
        var resizeCallback = function () { resize(el); };
        resizeCallback();
        $(el).keydown(resizeCallback).on('paste', resizeCallback);
    }
};

ko.bindingHandlers.tabbableFormField = {
    init: function(el, valueAccessor, allBindings, viewModel, bindingContext) {
        var article = bindingContext.$parent.article;

        $(el).keydown(function(e) {
            var keyCode = e.keyCode || e.which,
                formField,
                formFields,
                nextIndex;

            if (keyCode === 9) {
                e.preventDefault();
                formField = bindingContext.$rawData;
                formFields = _.filter(article.editors(), ed => ed.type === 'text' && ed.displayEditor());
                nextIndex = mod(formFields.indexOf(formField) + (e.shiftKey ? -1 : 1), formFields.length);
                var collection = articleCollection(article);
                mediator.emit('ui:open', formFields[nextIndex].meta, article, article.front, collection);
            }
        });
    }
};
