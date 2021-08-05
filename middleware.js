const path = require('path');
const launch = require('./index');

module.exports = function (specifiedEditor, srcRoot, onErrorCallback) {
  // 对参数做处理
  // 对第一个参数
  if (typeof specifiedEditor === 'function') {
    onErrorCallback = specifiedEditor;
    specifiedEditor = undefined;
  }

  // 对第二个参数
  if (typeof srcRoot === 'function') {
    onErrorCallback = srcRoot;
    srcRoot = undefined;
  }

  // 第二个参数很重要
  srcRoot = srcRoot || process.cwd();

  return function launchEditorMiddleware(req, res) {
    const { file } = req.query || {};
    if (!file) {
      res.statusCode = 500;
      res.end(`launch-editor-middleware: required query param "file" is missing.`);
    } else {
      // 执行程序
      launch(path.resolve(srcRoot, file), specifiedEditor, onErrorCallback);
      // 结束请求
      res.end();
    }
  };
};
