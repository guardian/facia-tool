import ko from 'knockout';
import _ from 'underscore';
import ColumnWidget from 'widgets/column-widget';
import Front from 'models/config/front';
import Collection from 'models/config/collection';

export default class Package extends ColumnWidget {

    constructor(params, element) {
        super(params, element);
        this.allPackages;
        this.searchedPackages = ko.observableArray();
        this.searchTerm = ko.observable('');
        this.populateAllPackages();
        this.subscribeOn(this.baseModel.state, this.populateAllPackages);
        this.subscribeOn(this.searchTerm, this.search);
        this.creatingPackage = ko.observable();
        this.storyPackage = ko.observable();
        this.displayName = ko.observable();
    };

    populateAllPackages() {
        var that = this;
        this.allPackages = _.map(this.baseModel.frontsList(), function (front) {
            return { name: that.baseModel.state().config.collections[front.collections[0]].displayName };
        });
    };

    search() {
        var lowerCaseSearchTerm = this.searchTerm().toLowerCase().match(/\S+/g);
        this.searchedPackages(_.filter(this.allPackages, function (existingPackage) {
            return existingPackage.name.toLowerCase().indexOf(lowerCaseSearchTerm) !== -1;
        }) );
    }

    createPackage() {
        var front = new Front({priority: this.baseModel.priority, isHidden: false});
        front.createCollection();
        this.creatingPackage(true);
        this.storyPackage(front.collections.items()[0]);
        this.storyPackage().meta.type = 'story-package';

    }

    savePackage() {
        this.storyPackage().meta.displayName = this.displayName();
        this.storyPackage().save();
        this.creatingPackage(false);
        this.displayName(null);
    }

}
