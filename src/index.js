import global from './global';
import {
    defer,
    isString,
    isStringOrStringArray,
    isFunction,
} from './utility';
import observe from './observe';
import click from './handler/click';
import Deferred from './Deferred';

const { // cache references
    options: g_options,
    observables: g_observables,
    targets: g_targets,
} = global;

const ERR_MSG = `${String.fromCodePoint(0x1F440)}TypeError: invalid arguments\n\t`;

const disconnect = () => {
    const { // destructure
        obsrvrs: {
            intr: g_intr,
            mutn: g_mutn,
        },
    } = global;

    document.body.removeEventListener('click', click);
    if (g_intr && g_mutn) {
        g_mutn.disconnect();
        // ref: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Browser_compatibility
        if (g_intr.disconnect) { // ie
            g_intr.disconnect();
        }
    }
};

// accept string, interface
const resolve = (...args) => {
    if (args && args.length === 2 && isString(args[0])) {
        // !important: indifferent of exact or regexp keys
        const target = g_targets[args[0]];
        // contains deferred data object
        if (target && target.data && target.data.resolve) {
            target.data.resolve(args[1]); // resolve provided data
            return;
        }
    }

    // error invalid arguments
    console.error(ERR_MSG, ...args);
};

const watch = (targets = {}, options = {}) => {
    // restructure arguments
    const omit = ((acc, [key, value]) => ((value) ? { ...acc, [key]: value } : acc));
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

    // prepare targets data
    const expected = { events: isStringOrStringArray, fn: isFunction };
    const prepare = ([key, value]) => {
        const target = struct.target(value);

        // ensure required properties exist
        if (Object.entries(expected).every(([prop, req]) => (target[prop] && req(target[prop])))) {
            // create deferred data object
            if (target.data && target.data instanceof Deferred) {
                target.data = defer();
            }

            // store internal target reference
            g_targets[key] = target;

            // store observable key and applicable intersection threshold
            if (target.events.includes('view')) {
                g_observables.set(key, (target.visible || g_options.visible));
            }
        } else { // error invalid arguments
            console.error(ERR_MSG, key, value);
        }
    };

    // prepare and store target references
    Object.entries(targets).forEach(prepare);

    // merge default and argument options
    Object.assign(g_options, struct.options(options));

    // attach observers
    if (g_observables.size) {
        observe();
    }

    // attach click event delegate
    document.body.addEventListener('click', click);
};

export default {
    Deferred,
    disconnect,
    resolve,
    watch,
};
