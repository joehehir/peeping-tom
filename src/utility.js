import global from './global';

// cache reference
const { dataset: g_name } = global.options;

// camel cased dataset
const nameCC = g_name.replace(/-(\w)/g, ($, $1) => $1.toUpperCase());

// create query selector string
const affixQuerySelector = (key) => {
    const map = {
        starts: ['^', /^\^/],
        ends: ['$', /\$$/],
    };
    // find affix
    const type = Object.keys(map).find((affix) => key[`${affix}With`](map[affix][0]));
    return (type)
        ? `[data-${g_name}${map[type][0]}="${key.replace(map[type][1], '')}"],`
        : `[data-${g_name}="${key}"],`;
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

const isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);

const isRegExpTarget = (attr, obj) => ((obj.keys)
    ? [...obj.keys()] // obj can be type object or map
    : Object.keys(obj)
).find((key) => new RegExp(key).test(attr));

const isString = (str) => !!(str && typeof str === 'string' && str.length);

// lazy match array iteration
const isStringOrStringArray = (arg) => (isString(arg) || (Array.isArray(arg) && !arg.some((entry) => !isString(entry))));

// dom node dataset match
const isTargetNode = (node) => ((node && node.nodeType === Node.ELEMENT_NODE && node.dataset && node.dataset[nameCC])
    ? node.dataset[nameCC]
    : null);

export {
    affixQuerySelector,
    defer,
    isFunction,
    isRegExpTarget,
    isString,
    isStringOrStringArray,
    isTargetNode,
};
