module.exports = function(api) {
  api.cache(true);
  const presets = [
    [
      '@babel/preset-env',
      {
        targets: { ie: 11 },
        modules: 'cjs',
        exclude: ['proposal-dynamic-import'],
      },
    ],
  ];
  const plugins = [
    ['@babel/plugin-transform-runtime', { corejs: 3 }],
    '@babel/plugin-transform-classes',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-shorthand-properties',
  ];

  return {
    presets,
    plugins,
  };
};
