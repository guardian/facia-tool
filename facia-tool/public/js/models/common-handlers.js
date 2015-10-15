import ko from 'knockout';
import $ from 'jquery';
import _ from 'underscore';
import mediator from 'utils/mediator';

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
                mediator.emit('ui:open', formFields[nextIndex].meta, article, article.front);
            }
        });
    }
};
