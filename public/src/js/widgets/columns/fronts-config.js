import ko from 'knockout';
import _ from 'underscore';
import findFirstById from '../../utils/find-first-by-id';
import Front from '../../models/config/front';
import frontCount from '../../utils/front-count';
import ColumnWidget from '../column-widget';
import alert from '../../utils/alert';
import CONST from '../../constants/defaults';
import isCodeEnvironment from '../../utils/is-code-environment';

export default class FrontConfig extends ColumnWidget {
    constructor(params, element) {
        super(params, element);
        this.pinnedFront = ko.observable();
        this.fronts = ko.observableArray();
        this.collections = ko.observableArray();

        this.populate();
        this.subscribeOn(this.baseModel.state, this.populate);
        this.loaded = Promise.resolve();
        this.setConfigMessages();
        this.subscribeOn(this.baseModel.state, this.setConfigMessages);

    }

    setConfigMessages() {
        if (isCodeEnvironment(this.baseModel.state().defaults)) {
            this.baseModel.message.codeEnvMessage(true);
        }

        const num = frontCount(this.baseModel.state().config.fronts, this.baseModel.priority);
        const remainingFronts = num.max - num.count;
        if (remainingFronts < CONST.frontAlertLimit) {
            this.baseModel.message.textMessage('You have ' + remainingFronts + ' fronts remaining');
        } else {
            this.baseModel.message.textMessage('');
        }
    }

    populate() {
        var pinnedId = this.pinnedFront() ? this.pinnedFront().id() : null,
            justCreatedFront;

        this.fronts(
            _.chain(this.baseModel.frontsList())
            .map(config => {
                let existingFront = findFirstById(this.fronts, config.id);
                if (existingFront){
                    existingFront.updateConfig(config);
                    return existingFront;
                } else {
                    let newFront = new Front(config);
                    if (config.id === pinnedId) {
                        justCreatedFront = newFront;
                        this.pinnedFront(null);
                    }
                    return newFront;
                }
            })
            .value()
        );

        if (justCreatedFront) {
            justCreatedFront.setOpen(true, false, true);
        }
    }

    createFront() {
        var front, num = frontCount(this.baseModel.state().config.fronts, this.baseModel.priority);

        if (num.count >= num.max) {
            alert('The maximum number of fronts (' + num.max + ') has been exceeded. Please delete one first, by removing all its collections.');
        } else if (this.pinnedFront()) {
            alert('You can only create one front at a time.');
        } else {
            front = new Front({priority: this.baseModel.priority, isHidden: true});
            front.setOpen(true);
            front.isNew(true);
            this.pinnedFront(front);
        }
    }

    openFront(front) {
        _.each(this.fronts(), f => {
            if (f.id() === front.id) {
                f.setOpen(true, false, true);
            } else {
                f.setOpen(false, false, false);
            }
        });
    }
}
