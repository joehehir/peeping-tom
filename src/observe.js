import global from './global';
import {
    affixQuerySelector,
} from './utility';
import {
    intersection,
    mutation,
    observeNodeList,
} from './handler/observer';

export default () => {
    const { // destructure references
        options: g_options,
        observables: g_observables,
        obsrvrs: g_obsrvrs,
    } = global;

    // construct intersection threshold array and query selector string
    const intersectionThresholdList = [g_options.visible];
    let querySelectorStr = [...g_observables].reduce((acc, [key, value]) => {
        if (!intersectionThresholdList.includes(value)) { // push unique values
            intersectionThresholdList.push(value);
        }
        // concat query selector
        return acc.concat(affixQuerySelector(key));
    }, '');
    // strip trailing comma
    querySelectorStr = querySelectorStr.substring(0, querySelectorStr.length - 1);

    // attach intersection observer
    g_obsrvrs.intr = new IntersectionObserver(intersection, {
        root: null, // browser viewport
        threshold: intersectionThresholdList.sort(),
        delay: 100,
    });

    // lookup then observe viewable nodes
    const renderedViewableNodes = document.querySelectorAll(querySelectorStr);
    if (renderedViewableNodes && renderedViewableNodes.length) {
        observeNodeList(renderedViewableNodes);
    }

    // detect injection of nodes
    g_obsrvrs.mutn = new MutationObserver(mutation);
    g_obsrvrs.mutn.observe(g_options.root, {
        attributes: false,
        characterData: false,
        childList: true,
        subtree: true,
    });
};
