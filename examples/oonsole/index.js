
/* eslint-disable-next-line no-unused-vars, func-names */
const oonsole = (function () {
    // ...transpile this script...
    if (!(window && window.Proxy)) return console.log;

    // hyperscript-esque
    const h = (tag, attrs, content) => {
        const node = document.createElement(tag);
        Object.entries(attrs).forEach(([name, value]) => {
            if (name === 'style') { // concat inline styles
                node.setAttribute(name, Object.entries(value).reduce((acc, rule) => acc.concat(`${rule.join(':')};`), ''));
            } else node.setAttribute(name, value);
        });

        if (content) {
            if (Array.isArray(content)) node.append(...content);
            else node.append(content);
        }

        return node;
    };

    // scoped stylesheet
    const styles = `
        .feed {
            display: flex;
            flex-direction: column-reverse;
            flex: auto;
            overflow: auto;
            white-space: pre-wrap;
            font-family: monospace;
            background-color: #121212;
            color: rgba(255, 255, 255, 0.87);
            border-radius: inherit;
        }
        .output p {
            padding-left: 0.4em;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }
    `;

    const output = h('output', { class: 'output' });
    const root = h('aside', {
        id: 'oonsole',
        style: { /* eslint-disable quote-props */
            'display': 'flex',
            'flex-flow': 'column',
            'border-radius': '0.4em',
            'background-color': '#121212',
            'position': 'fixed',
            'width': '75vw',
            'height': '10em',
            'bottom': '1em',
            'right': '1em',
        }, /* eslint-enable quote-props */
    }, [
        h('style', { scoped: '' }, styles),
        h('div', { class: 'feed' }, output),
    ]);
    document.body.append(root);

    const extension = (args) => {
        if (output) {
            output.append(h('p', {}, JSON.stringify(...args)));
        }
    };

    const isFunction = (arg) => !!(arg && arg.constructor && arg.call && arg.apply);

    const handler = {
        get(target, property, receiver) {
            const fn = target[property];
            return (...args) => {
                // invoke native then extension
                if (isFunction(fn) && isFunction(extension)) {
                    const result = fn.apply(receiver, args);
                    extension(args);

                    // return native
                    return result;
                }
                return undefined;
            };
        },
    };
    return new Proxy(console, handler);
}());
