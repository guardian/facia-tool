import {CONST} from '../../modules/vars';

export function headline() {
    const meta = this.meta, fields = this.fields;
    if (this.state.enableContentOverrides()) {
        return meta.headline() || fields.headline() || (meta.snapType() ? 'No headline!' : 'Loading...');
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
