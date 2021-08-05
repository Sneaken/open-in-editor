const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const guessEditor = require('./guess-editor');
const getArgumentsForPosition = require('./get-args');
const childProcess = require('child_process');

function isTerminalEditor(editor) {
  switch (editor) {
    case 'vim':
    case 'emacs':
    case 'nano':
      return true;
  }
  return false;
}

const positionRE = /:(\d+)(:(\d+))?$/;

function parseFile(file) {
  const fileName = file.replace(positionRE, '');
  const match = file.match(positionRE);
  const lineNumber = match && match[1];
  const columnNumber = match && match[3];
  return {
    fileName,
    lineNumber,
    columnNumber,
  };
}

function wrapErrorCallback(cb) {
  return function (fileName, errorMessage) {
    console.log();
    console.log(chalk.red('Could not open ' + path.basename(fileName) + ' in the editor.'));

    if (errorMessage) {
      // 检查句末有没有句号
      if (errorMessage[errorMessage.length - 1] !== '.') {
        errorMessage += '.';
      }
      console.log(chalk.red('The editor process exited with an error: ' + errorMessage));
      console.log();
      if (cb) cb(fileName, errorMessage);
    }
  };
}

let _childProcess = null;

/**
 *
 * @param file 打开的文件的全路径
 * @param specifiedEditor 指定的编辑器
 * @param onErrorCallback 错误回调
 */
function launchEditor(file, specifiedEditor, onErrorCallback) {
  const parse = parseFile(file);
  let { fileName } = parse;
  const { lineNumber, columnNumber } = parse;

  if (!fs.existsSync(fileName)) {
    return;
  }
  if (typeof specifiedEditor === 'function') {
    onErrorCallback = specifiedEditor;
    specifiedEditor = undefined;
  }

  onErrorCallback = wrapErrorCallback(onErrorCallback);

  const [editor, ...args] = guessEditor(specifiedEditor);

  if (!editor) {
    onErrorCallback(fileName, null);
    return;
  }

  if (lineNumber) {
    const extraArgs = getArgumentsForPosition(editor, fileName, lineNumber, columnNumber);
    args.push.apply(args, extraArgs);
  } else {
    args.push(fileName);
  }

  if (_childProcess && isTerminalEditor(editor)) {
    _childProcess.kill('SIGKILL');
  }

  if (process.platform === 'win32') {
    // Ignore...
  } else {
    _childProcess = childProcess.spawn(editor, args, { stdio: 'inherit' });
  }

  _childProcess.on('exit', function (errorCode) {
    _childProcess = null;

    if (errorCode) {
      onErrorCallback(fileName, `(code ${errorCode})`);
    }
  });

  _childProcess.on('error', function (error) {
    onErrorCallback(fileName, error.message);
  });
}

module.exports = launchEditor;
