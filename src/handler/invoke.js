import {
    defer,
    isFunction,
} from '../utility';
import global from '../global';

// event handler
export default (key, event, node) => {
    const target = global.targets[key];
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
        // !important: indifferent of exact or regexp keys
        target.data.promise.then((data) => {
            invokeFn(data);
        }).catch(() => { target.data = defer(); });
    } else {
        invokeFn(target.data);
    }
};
