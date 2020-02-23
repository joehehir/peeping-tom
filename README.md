# peeping-tom

Event delegate for user journey and interaction tracking. Provides performant and configurable event capture via an easy to maintain object format.

See [**examples**](https://joehehir.github.io/peeping-tom/examples/) for demonstration.

## Attribute

```html
<button data-peeping-tom="signup"></button>
```

**data-peeping-tom:** `String`

Unique key corresponding to a `target` object that should be defined using the properties described below.

## Methods

## **watch()**

The `peepingTom.watch()` method instantiates the library using provided parameters.

### Syntax

```js
peepingTom.watch(targets[, config]);
```

### Parameters

- **[targets](#targets):** `Object`

    - **key:** `String`

        Object key used to map functionality to element(s) containing a corresponding `data-peeping-tom` HTML attribute. Supports regular expression anchors to target element collections using affixes `^prefix-`, `-suffix$`.

    - **value:** `Object`

        - **events:** `String` | `String[]`

            Event(s) to track: `'click'`, `'view'`.

        - **data:** `Interface` | `Function` | `peepingTom.Deferred`

            - `Interface` any data type to be provided as an argument to **fn**.
            - `Function` definition that is invoked upon event occurrence. Provided **event** `String` and **node** `Element` arguments.
            - `peepingTom.Deferred` class can be used to create an asynchronous, mutual dependency between **event** occurrence and invocation of the [**resolveAsyncData**](#resolveAsyncData) method.

        - **fn:** `Function`

            Function definition to be invoked.

        - **visible:** `Number` **|Optional**

            Floating point number representing a specific visibility threshold at which to invoke the `'view'` event. Expects value between `0.0` and `1.0`, where `1.0` equals entire element visibility.

- **config:** `Object` **|Optional**

    - **dataset:** `String`

        Dataset name to override the default `data-peeping-tom` HTML attribute. Each to their own!

    - **root:** `Element`

        Top-level element on which to capture events. Defaults to `document.body`.

    - **visible:** `Number`

        Global element visibility threshold. Floating point number representing a specific visibility threshold at which to invoke the `'view'` event. Expects value between `0.0` and `1.0`, where `1.0` equals entire element visibility. Defaults to `0.8`.

## **resolveAsyncData()**

Sets **data** property value asynchronously.

**Requires:** Asynchronous **data** declaration using — `data: new peepingTom.Deferred`

### Syntax

```js
peepingTom.resolveAsyncData(key, data);
```

### Parameters

- **key:** `String`

- **data:** `Interface` | `Function`

## **disconnect()**

Removes event listeners and observers.

### Syntax

```js
peepingTom.disconnect();
```

## Examples

### **targets:** `Object`

```js
const targets = {
    'signup': {
        events: 'click',
        data: {
            'event': 'signup-click',
            'pageCategory': 'signup',
            'visitorType': 'high-value',
        },
        fn: data => dataLayer.push(data),
    },
    '^recommended-product-': {
        events: ['click', 'view'],
        data: new peepingTom.Deferred,
        fn: data => dataLayer.push(data),
        visible: 0.6,
    }
};
```

### **resolveAsyncData:** `Function`
```js
peepingTom.resolveAsyncData('^recommended-product-', { type: 'previously-viewed' });
```

## Dependencies

- **IntersectionObserver** polyfill for the usual suspects.

## Compatibility

Chrome 60

Firefox 54

Internet Explorer 11

## Troubleshooting

- **Click event capture:** If click events are being blocked other elements. Try applying the CSS rule `pointer-events: none;` to allow pointer events to pass through to the desired target.
