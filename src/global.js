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

export default {
    options,
    observables,
    obsrvrs,
    targets,
    viewables,
};
