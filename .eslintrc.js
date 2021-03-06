module.exports = {
    'env': {
        'browser': true,
    },
    'extends': ['airbnb-base'],
    'rules': {
        'no-console': 'off',
        'indent': ['error', 4],
        'camelcase': ['error', {
            'allow': ['^g_'],
        }],
        'max-len': ['error', {
            'ignoreComments': true,
            'code': 160,
        }],
    },
};
