import {CONST} from '../modules/vars';
import _ from 'underscore';

export default function countFronts (fronts, priority = CONST.defaultPriority) {
    const priorityDefinition = CONST.priorities[priority] || {};

    return {
        count: _.countBy(_.values(fronts), function (front) {
            return front.priority || CONST.defaultPriority;
        })[priority] || 0,
        max: priorityDefinition.maxFronts || Infinity
    };
}
