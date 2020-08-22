/* eslint-disable no-underscore-dangle, no-unused-vars, func-names */
const oonsole = (() => {
    if (!(window && window.Proxy)) return console.log;

    // poor man's css minimiser
    const minCSS = (s) => s
        .replace(/[\n\r]|\s{2,}/g, '')
        .replace(/([:,])\s+|\s+(\{)/g, '$1$2');

    // hyperscript-esque
    const h = (tag, attrs, content) => {
        const node = document.createElement(tag);
        Object.entries(attrs).forEach(([name, value]) => {
            if (name === 'style') {
                node.setAttribute(name, minCSS(value));
            } else node.setAttribute(name, value);
        });

        if (content) {
            if (Array.isArray(content)) node.append(...content);
            else node.append(content);
        }

        return node;
    };

    const css = {
        root: `
            display: flex;
            flex-flow: column;
            position: fixed;
            width: 100vw;
            height: 10em;
            bottom: 0;
            background-color: #121212;
        `,
        scoped: `
            ._c {
                display: flex;
                flex-direction: column-reverse;
                flex: auto;
                overflow: auto;
                white-space: pre-wrap;
                font-family: monospace;
                background-color: #121212;
                color: rgba(255, 255, 255, 0.88);
                border-radius: inherit;
            }
            ._o {
                width: max-content;
                min-width: 100%;
            }
            ._r {
                padding: 0 3ch 0 3ch;
                border-bottom: 1px solid rgba(255, 255, 255, 0.12);
                cursor: default;
            }
            ._r i {
                display: inline-block;
                transform: scale(0.7, 1.2);
            }
            ._r i,
            ._r code {
                pointer-events: none;
            }
        `,
    };

    const output = h('output', { class: '_o' });
    output.addEventListener('click', (e) => {
        const selection = window.getSelection().toString(); // text selection
        const parent = (e.target && e.target.classList.contains('_r')) ? e.target : null;

        if (!(selection.length) && parent) {
            const code = parent.querySelector('code');
            if (code && code._args) { // toggle pretty-print
                code.textContent = (code.classList.contains('_pp'))
                    ? JSON.stringify(...code._args)
                    : JSON.stringify(...code._args, null, 2);

                code.classList.toggle('_pp');
            }
        }
    });

    const root = h('aside', { class: 'oonsole', style: css.root }, [
        h('style', { scoped: '' }, minCSS(css.scoped)),
        h('div', { class: '_c' }, output),
    ]);

    // inject
    document.body.append(root);

    const extension = (args) => {
        if (output) {
            const row = h('p', { class: '_r' }, [
                h('i', {}, '\u25BA'),
                (() => {
                    const code = h('code', {}, JSON.stringify(...args));
                    code._args = args;
                    return code;
                })(),
            ]);

            output.append(row);
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
})();
/* eslint-disable no-underscore-dangle, no-unused-vars, func-names */
