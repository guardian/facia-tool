import BaseWidget from './base-widget';

export default class ColumnWidget extends BaseWidget {
    constructor(params, element) {
        super(params, element);
        this.column = params.column;
        this.baseModel = params.baseModel;
        params.column.registerMainWidget(this);
    }
}
