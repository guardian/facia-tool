import _ from 'underscore';

export function displayLabel(opts, index, all) {
    if (opts.type === 'boolean') {
        const display = opts.editable &&
            _.result(this.meta, opts.key, false) &&
            (opts.omitIfNo ? _.some(all, editor => editor.key === opts.omitIfNo && this.meta[editor.key]()) : true) &&
            (opts.omitForSupporting ? this.group && this.group.parentType !== 'Article' : true);

        const label = _.chain([
            opts.label,
            _.result(this.state, opts.labelState),
            _.result(this.meta,  opts.labelMeta)
        ])
        .compact()
        .value()
        .join(': ');

        return display ? label : false;
    } else {
        return false;
    }
}
