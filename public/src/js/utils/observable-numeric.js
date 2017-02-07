import ko from 'knockout';

export default function(initialValue) {
    var actual = ko.observable(initialValue);
    return ko.dependentObservable({
        read: function ()
        {
            return actual();
        },
        write: function (newValue)
        {
            var parsedValue = parseFloat(newValue);
            actual(isNaN(parsedValue) ? newValue : parsedValue);
        }
    });
}
