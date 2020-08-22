import {
    obsrvrs as g_obsrvrs,
    observables as g_observables,
    options as g_options,
    targets as g_targets,
} from './global';
import click from './handler/click';
import observe from './observe';
import {
    defer,
    isElementNode,
    isString,
    isStringOrStringArray,
    isFunction,
} from './utility';

const ERR_MSG = `${String.fromCodePoint(0x1F440)}TypeError: invalid arguments\n\t`;

// noop deferred data identifier
function Deferred() {}

const disconnect = () => {
    const g_intr = g_obsrvrs.intr;
    const g_mutn = g_obsrvrs.mutn;

    g_options.root.removeEventListener('click', click);
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
        const target = g_targets[key];
        // contains deferred data object
        if (target && target.data && target.data.resolve) {
            target.data.resolve(value); // resolve provided value
            return;
        }
    }

    // !error: invalid arguments
    console.error(ERR_MSG, key, value);
};

const watch = (targets, options) => {
    /* eslint-disable no-param-reassign */
    targets = targets || {};
    options = options || {};
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
            g_targets[key] = target;

            // store observable key and applicable intersection threshold
            if (target.events.includes('view')) {
                const vis = (Object.prototype.hasOwnProperty.call(target, 'visible') && isThreshold(target.visible))
                    ? Math.abs(target.visible) // ensure positive
                    : g_options.visible;
                g_observables.set(key, vis);
            }
        } else { // !error: invalid arguments
            console.error(ERR_MSG, key, value);
        }
    };

    // prepare and store target references
    Object.entries(targets).forEach(prepare);

    // merge default and argument options
    Object.assign(g_options, struct.options(options));

    // validate global options
    if (!Object.entries({
        dataset: isString,
        root: isElementNode,
        visible: isThreshold,
    }).some(([prop, req]) => !(Object.prototype.hasOwnProperty.call(options, prop) ? req(options[prop]) : true))) {
        // attach observers
        if (g_observables.size) {
            observe();
        }

        // attach click event delegate
        g_options.root.addEventListener('click', click);
    } else {
        // !error: invalid arguments
        console.error(ERR_MSG, options);
    }
};

export default {
    Deferred,
    disconnect,
    resolve,
    watch,
};
