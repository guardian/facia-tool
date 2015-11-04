import BaseWidget from 'widgets/base-widget';
import ko from 'knockout';
import * as vars from 'modules/vars';

export default class CollectionDrop extends BaseWidget {
    constructor() {
        super();
        this.storedData = null;

        this.displayName = ko.observable();
        this.underDrag = ko.observable(false);
        this.valueChangeFromDrag = false;

        var that = this;
        this.displayName.subscribe(function(newValue) {
            if (that.valueChangeFromDrag) {
                that.valueChangeFromDrag = false;
            } else {
                that.storedData = {
                    value: newValue,
                    type: 'capiQuery'
                };
            }
        });

        this.valueChangeFromDrag = false;
    }

    addData(data) {
        this.valueChangeFromDrag = true;
        this.storedData = {
            id: data.id,
            type: 'collection'
        };
        this.displayName(vars.model.state().config.collections[data.id].displayName);
    }
}

