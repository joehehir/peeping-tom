module.exports = {
    'presets': [
        ['@babel/preset-env', {
            'useBuiltIns': 'usage',
            'corejs': 'core-js@3',
            'targets': {
                'chrome': 60,
                'firefox': 54,
                'ie': 11,
            },
        }],
    ],
    'overrides': [{
        'sourceType': 'unambiguous',
    }],
};
