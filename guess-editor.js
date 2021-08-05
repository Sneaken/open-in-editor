const shellQuote = require('shell-quote')
const childProcess = require("child_process")

// Map from full process name to binary that starts the process
// We can't just re-use full process name, because it will spawn a new instance
// of the app every time
const COMMON_EDITORS_OSX = require('./editor-info/osx')
// const COMMON_EDITORS_WIN = require('./editor-info/windows')
// const COMMON_EDITORS_LINUX = require('./editor-info/linux')

module.exports = function guessEditor (specifiedEditor) {
  if (specifiedEditor) {
    // 这是在避免生么？
    console.log('guess specifiedEditor =>', specifiedEditor)
    return shellQuote.parse(specifiedEditor)
  }

  try {

    if (process.platform === 'darwin') {
      const output = childProcess.execSync('ps x').toString()
      const processNames = Object.keys(COMMON_EDITORS_OSX)
      for (let i = 0; i < processNames.length; i++) {
        const processName = processNames[i]
        if (output.includes(processName)) {
          return [COMMON_EDITORS_OSX[processName]]
        }

      }
    } else if (process.platform === 'win32') {
      // Ignore ...
    } else if (process.platform === 'linux') {
      // Ignore ...
    }

  } catch (error) {
    // Ignore ... (不写这行 似乎格式校验不过 因为不能为空行)
  }
}
