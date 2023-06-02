import _ from 'underscore';
import Droppable from './modules/droppable';
import {CONST} from './modules/vars';
import GridUtil from 'grid-util-js';

function Article (element) {
    this.Text = element.querySelector('a').getAttribute('href');
}
function Collection (element) {
    this.Text = element.querySelector('a').getAttribute('href');
}
class Media {
    constructor(assets, origin) {
        this[GridUtil.CROPS_DATA_IDENTIFIER] = JSON.stringify({
            id: 'fake_image_from_media',
            assets: assets
        });
        this[GridUtil.GRID_URL_DATA_IDENTIFIER] = origin;
    }

    dropTo(target) {
        const dropTarget = target.dropTarget();
        const droppableTarget = createDroppable(dropTarget);

        droppableTarget.dragover(dropTarget, this);
        const maybeFuture = droppableTarget.drop(dropTarget, this);
        return Promise.resolve(maybeFuture);
    }

    dropInEditor(target) {
        const droppableTarget = createDroppable(target);

        const maybeFuture = droppableTarget.dropInEditor(target, this);
        return Promise.resolve(maybeFuture);
    }
}
class MediaMeta extends Media {
    constructor(meta) {
        super();
        this.sourceMeta = JSON.stringify(meta);
    }
}
class ConfigCollection {
    constructor(source) {
        this.Text = 'a collection';
        this.sourceItem = JSON.stringify(Object.assign({
            type: CONST.draggableTypes.configCollection
        }, source));
    }
}

function Event (extend) {
    this.preventDefault = function () {};
    this.stopPropagation = function () {};
    _.extend(this, extend);
}

function drop (element, target, source, alternate) {
    return Droppable.listeners.drop(element, new Event({
        target: target,
        dataTransfer: {
            getData: function (what) {
                var value = source[what];
                return value || '';
            }
        },
        ctrlKey: !!alternate
    }));
}

function dropInEditor (element, target, source, alternate) {
    return Droppable.imageEditor.drop(element, new Event({
        target: target,
        dataTransfer: {
            getData: function (what) {
                var value = source[what];
                return value || '';
            }
        },
        ctrlKey: !!alternate
    }));
}

function dropInBackfill (element, target, source) {
    return Droppable.backfillListeners.drop(element, new Event({
        target: target,
        dataTransfer: {
            getData: function (what) {
                return source[what] || '';
            }
        }
    }));
}

function over (element, target) {
    return Droppable.listeners.dragover(element, new Event({
        target: target
    }));
}

function start (element, target, source) {
    return Droppable.listeners.dragstart(element, new Event({
        target: target,
        dataTransfer: {
            setData: function (what, value) {
                source[what] = value;
            }
        }
    }));
}

function leave (element, target) {
    return Droppable.listeners.dragleave(element, new Event({
        target: target
    }));
}

function createDroppable (element) {
    return {
        drop: drop.bind(null, element),
        dragover: over.bind(null, element),
        dragstart: start.bind(null, element),
        dragleave: leave.bind(null, element),
        dropInEditor: dropInEditor.bind(null, element),
        dropInBackfill: dropInBackfill.bind(null, element)
    };
}

export default {
    Article,
    Collection,
    Media,
    MediaMeta,
    ConfigCollection,
    droppable: createDroppable
};
