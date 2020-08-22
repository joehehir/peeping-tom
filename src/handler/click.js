import {
    obsrvrs as g_obsrvrs,
    targets as g_targets,
    viewables as g_viewables,
} from '../global';
import invoke from './invoke';
import {
    isRegExpTarget,
    isTargetNode,
} from '../utility';

// click event delegate
export default (e) => {
    const g_intr = g_obsrvrs.intr;

    const identifier = isTargetNode(e.target);
    if (identifier) {
        // node is group or unique
        const regExpTargetKey = isRegExpTarget(identifier, g_targets);
        const key = regExpTargetKey || identifier;

        // string or array includes click event type
        if (g_targets[key] && g_targets[key].events.includes(e.type)) {
            // register view event when click captured
            if (g_viewables.has(e.target) && g_intr) {
                g_intr.unobserve(e.target);
                g_viewables.delete(e.target);
                invoke(key, [e.type, 'view'], e.target);
            } else invoke(key, e.type, e.target);
        }
    }
};
