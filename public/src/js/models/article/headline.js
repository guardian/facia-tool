import {CONST} from 'modules/vars';

export function headline() {
    const meta = this.meta, fields = this.fields;
    if (this.state.enableContentOverrides()) {
		const text = meta.headline() === undefined ? fields.headline() : meta.headline();
        return text || 'No headline!';
    } else {
        return '{ ' + meta.customKicker() + ' }';
    }
}

export function headlineLength() {
    return (this.meta.headline() || this.fields.headline() || '').length;
}

export function headlineLengthAlert() {
    return (this.meta.headline() || this.fields.headline() || '').length > CONST.restrictedHeadlineLength;
}
