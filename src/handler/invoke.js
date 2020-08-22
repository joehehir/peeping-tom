import { targets as g_targets } from '../global';
import {
    defer,
    isFunction,
} from '../utility';

// event handler
export default (key, event, node) => {
    const target = g_targets[key];
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
