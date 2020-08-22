module.exports = {
    'plugins': [
        ['@babel/plugin-transform-arrow-functions'],
        ['@babel/plugin-transform-block-scoped-functions'],
        ['@babel/plugin-transform-block-scoping'],
        ['@babel/plugin-transform-function-name'],
        ['@babel/plugin-transform-shorthand-properties'],
        ['@babel/plugin-transform-template-literals'],
    ],
    'overrides': [{
        'sourceType': 'unambiguous',
    }],
};
