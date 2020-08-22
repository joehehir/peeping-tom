// default options
const options = {
    dataset: 'peeping-tom',
    root: document.body,
    visible: 0.8,
};

// observable targets
const observables = new Map();

// intersection/mutation observers
const obsrvrs = {
    intr: undefined,
    mutn: undefined,
};

// targets argument reference
const targets = {};

// weak references to connected observable nodes
const viewables = new WeakSet();

// cache reference
const g_dataset = options.dataset;

// camel cased dataset
const nameCC = g_dataset.replace(/-(\w)/g, ($, $1) => $1.toUpperCase());

// create query selector string
const affixQuerySelector = (key) => {
    const map = {
        starts: ['^', /^\^/],
        ends: ['$', /\$$/],
    };
    // find affix
    const type = Object.keys(map).find((affix) => key[`${affix}With`](map[affix][0]));
    return (type)
        ? `[data-${g_dataset}${map[type][0]}="${key.replace(map[type][1], '')}"],`
        : `[data-${g_dataset}="${key}"],`;
    // sample return values: '[data-peeping-tom="exact-match"],[data-peeping-tom^="prefix-"],[data-peeping-tom$="-suffix"],'
};

// expose promise callbacks
const defer = () => {
    const exposed = {
        promise: null,
        resolve: null,
        reject: null,
    };

    exposed.promise = new Promise((resolve, reject) => {
        exposed.resolve = resolve;
        exposed.reject = reject;
    });

    return exposed;
};

const isElementNode = (node) => (node && node.nodeType === Node.ELEMENT_NODE);

const isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);

const isRegExpTarget = (attr, obj) => ((obj.keys)
    ? Array.from(obj.keys()) // obj can be type object or map
    : Object.keys(obj)
).find((key) => new RegExp(key).test(attr));

const isString = (str) => !!(str && typeof str === 'string' && str.length);

// lazy match array iteration
const isStringOrStringArray = (arg) => (isString(arg) || (Array.isArray(arg) && !arg.some((entry) => !isString(entry))));

// dom node dataset match
const isTargetNode = (node) => ((isElementNode(node) && node.dataset && node.dataset[nameCC])
    ? node.dataset[nameCC]
    : null);

// event handler
var invoke = (key, event, node) => {
    const target = targets[key];
    if (!(target && target.data && isFunction(target.fn))) {
        return;
    }

    const invokeFn = (data) => {
        // function or static data
        if (isFunction(data)) {
            target.fn(data(event, node));
        } else target.fn(data);
    };

    // detect deferred data
    if (target.data.promise) {
        // !important: exact or regexp keys
        target.data.promise.then((data) => {
            invokeFn(data);
        }).catch(() => { target.data = defer(); });
    } else {
        invokeFn(target.data);
    }
};

// click event delegate
var click = (e) => {
    const g_intr = obsrvrs.intr;

    const identifier = isTargetNode(e.target);
    if (identifier) {
        // node is group or unique
        const regExpTargetKey = isRegExpTarget(identifier, targets);
        const key = regExpTargetKey || identifier;

        // string or array includes click event type
        if (targets[key] && targets[key].events.includes(e.type)) {
            // register view event when click captured
            if (viewables.has(e.target) && g_intr) {
                g_intr.unobserve(e.target);
                viewables.delete(e.target);
                invoke(key, [e.type, 'view'], e.target);
            } else invoke(key, e.type, e.target);
        }
    }
};

// detect view event and unobserve node
const intersection = (entries, observer) => {
    const intersect = (entry) => {
        // validate node and intersection
        const identifier = isTargetNode(entry.target);
        if (identifier && entry.isIntersecting) {
            const regExpTargetKey = isRegExpTarget(identifier, observables);
            const key = regExpTargetKey || identifier;

            // key specific intersection threshold
            const visible = observables.get(key);
            if (!(visible && entry.intersectionRatio >= visible)) {
                return;
            }

            // unobserve and invoke fn
            observer.unobserve(entry.target);
            viewables.delete(entry.target);
            invoke(key, 'view', entry.target);
        }
    };

    entries.forEach(intersect);
};

// ref: https://dom.spec.whatwg.org/#garbage-collection
const observeNodeList = (nodeList) => {
    const g_intr = obsrvrs.intr;

    const observe = (node) => {
        // match exact or regexp key and observe node
        const identifier = isTargetNode(node);
        if (identifier) {
            const regExpTargetKey = isRegExpTarget(identifier, observables);
            const key = regExpTargetKey || identifier;
            if (observables.has(key) && g_intr) {
                g_intr.observe(node);
                viewables.add(node); // store node
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

var observe = () => {
    // construct intersection threshold array and query selector string
    const intersectionThresholdList = [options.visible];
    let querySelectorStr = Array.from(observables).reduce((acc, [key, value]) => {
        if (!intersectionThresholdList.includes(value)) { // push unique values
            intersectionThresholdList.push(value);
        }
        // concat query selector
        return acc.concat(affixQuerySelector(key));
    }, '');
    // strip trailing comma
    querySelectorStr = querySelectorStr.substring(0, querySelectorStr.length - 1);

    // attach intersection observer
    obsrvrs.intr = new IntersectionObserver(intersection, {
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
    obsrvrs.mutn = new MutationObserver(mutation);
    obsrvrs.mutn.observe(options.root, {
        attributes: false,
        characterData: false,
        childList: true,
        subtree: true,
    });
};

const ERR_MSG = `${String.fromCodePoint(0x1F440)}TypeError: invalid arguments\n\t`;

// noop deferred data identifier
function Deferred() {}

const disconnect = () => {
    const g_intr = obsrvrs.intr;
    const g_mutn = obsrvrs.mutn;

    options.root.removeEventListener('click', click);
    if (g_intr && g_mutn) {
        g_mutn.disconnect();
        // ref: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Browser_compatibility
        if (g_intr.disconnect) { // internet explorer
            g_intr.disconnect();
        }
    }
};

// accept string, interface
const resolve = (key, value) => {
    if (isString(key)) {
        // !important: exact or regexp keys
        const target = targets[key];
        // contains deferred data object
        if (target && target.data && target.data.resolve) {
            target.data.resolve(value); // resolve provided value
            return;
        }
    }

    // !error: invalid arguments
    console.error(ERR_MSG, key, value);
};

const watch = (targets$1, options$1) => {
    /* eslint-disable no-param-reassign */
    targets$1 = targets$1 || {};
    options$1 = options$1 || {};
    /* eslint-enable no-param-reassign */

    // restructure arguments
    const omit = (acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
    };
    const struct = {
        options: (({
            dataset,
            root,
            visible,
        }) => Object.entries({ dataset, root, visible }).reduce(omit, {})),
        target: (({
            events,
            visible,
            data,
            fn,
        }) => ({
            events,
            visible,
            data,
            fn,
        })), // append omitted properties
    };

    const isThreshold = (n) => !!(n !== undefined && n !== null && typeof n === 'number' && (n - 0) * (1 - n) >= 0);

    // prepare targets data
    const required = { events: isStringOrStringArray, fn: isFunction };
    const prepare = ([key, value]) => {
        const target = struct.target(value);

        // ensure required properties exist
        if (Object.entries(required).every(([prop, req]) => (target[prop] && req(target[prop])))) {
            // create deferred data object
            if (target.data && target.data instanceof Deferred) {
                target.data = defer();
            }

            // store internal target reference
            targets[key] = target;

            // store observable key and applicable intersection threshold
            if (target.events.includes('view')) {
                const vis = (Object.prototype.hasOwnProperty.call(target, 'visible') && isThreshold(target.visible))
                    ? Math.abs(target.visible) // ensure positive
                    : options.visible;
                observables.set(key, vis);
            }
        } else { // !error: invalid arguments
            console.error(ERR_MSG, key, value);
        }
    };

    // prepare and store target references
    Object.entries(targets$1).forEach(prepare);

    // merge default and argument options
    Object.assign(options, struct.options(options$1));

    // validate global options
    if (!Object.entries({
        dataset: isString,
        root: isElementNode,
        visible: isThreshold,
    }).some(([prop, req]) => !(Object.prototype.hasOwnProperty.call(options$1, prop) ? req(options$1[prop]) : true))) {
        // attach observers
        if (observables.size) {
            observe();
        }

        // attach click event delegate
        options.root.addEventListener('click', click);
    } else {
        // !error: invalid arguments
        console.error(ERR_MSG, options$1);
    }
};

var index = {
    Deferred,
    disconnect,
    resolve,
    watch,
};

export default index;
