const path = require('path');

module.exports = {
  entry: './game.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'var',
    library: 'Game'
  },
};