import {
    obsrvrs as g_obsrvrs,
    observables as g_observables,
    viewables as g_viewables,
} from '../global';
import invoke from './invoke';
import {
    isRegExpTarget,
    isTargetNode,
} from '../utility';

// detect view event and unobserve node
const intersection = (entries, observer) => {
    const intersect = (entry) => {
        // validate node and intersection
        const identifier = isTargetNode(entry.target);
        if (identifier && entry.isIntersecting) {
            const regExpTargetKey = isRegExpTarget(identifier, g_observables);
            const key = regExpTargetKey || identifier;

            // key specific intersection threshold
            const visible = g_observables.get(key);
            if (!(visible && entry.intersectionRatio >= visible)) {
                return;
            }

            // unobserve and invoke fn
            observer.unobserve(entry.target);
            g_viewables.delete(entry.target);
            invoke(key, 'view', entry.target);
        }
    };

    entries.forEach(intersect);
};

// ref: https://dom.spec.whatwg.org/#garbage-collection
const observeNodeList = (nodeList) => {
    const g_intr = g_obsrvrs.intr;

    const observe = (node) => {
        // match exact or regexp key and observe node
        const identifier = isTargetNode(node);
        if (identifier) {
            const regExpTargetKey = isRegExpTarget(identifier, g_observables);
            const key = regExpTargetKey || identifier;
            if (g_observables.has(key) && g_intr) {
                g_intr.observe(node);
                g_viewables.add(node); // store node
            }
        }
    };

    nodeList.forEach(observe);
};

const mutation = (mutationList) => {
    mutationList.forEach((mutationRecord) => {
        if (!(
            mutationRecord.type === 'childList'
            && mutationRecord.addedNodes
            && mutationRecord.addedNodes.length
        )) {
            return;
        }

        observeNodeList(mutationRecord.addedNodes);
    });
};

export {
    intersection,
    mutation,
    observeNodeList,
};
