import {
    isRegExpTarget,
    isTargetNode,
} from '../utility';
import global from '../global';
import invoke from './invoke';

// click event delegate
export default (e) => {
    const { // destructure references
        obsrvrs: {
            intr: g_intr,
        },
        targets: g_targets,
        viewables: g_viewables,
    } = global;

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
