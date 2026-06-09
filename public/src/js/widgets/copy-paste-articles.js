import ko from 'knockout';
import copiedArticle from 'modules/copied-article';
import Extension from 'models/extension';

export default class extends Extension {
    constructor(baseModel) {
        super(baseModel);

        if (!ko.isObservable(baseModel.isPasteActive)) {
            baseModel.isPasteActive = ko.observable(false);
        }
        baseModel.isPasteActive(!!copiedArticle.peek());
        this.listenOn(copiedArticle, 'change', hasArticle => baseModel.isPasteActive(hasArticle));
    }
}
