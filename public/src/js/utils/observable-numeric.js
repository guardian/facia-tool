import ko from 'knockout';

export default function(initialValue) {
    var actual = ko.observable(initialValue);
    return ko.dependentObservable({
        read() {
            return actual();
        },
        write(newValue) {
            var parsedValue = parseFloat(newValue);
            actual(isNaN(parsedValue) ? newValue : Math.abs(parsedValue));
        }
    });
}
