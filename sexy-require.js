var _path = require(`path`)
var join = _path.join
var existsSync = require(`fs`).existsSync
var readFileSync = require(`fs`).readFileSync

const shortcuts = {}
const root = _path.resolve('./')

function getOptions() {
  var path = join(root, `.paths`)
  if (!existsSync(path)) return {}
  var text = readFileSync(path, {encoding: `utf8`})
  var re = /(\$[\w-]+)\s*=\s*(.+)/gm
  var match, options = {}
  while(match = re.exec(text)) {
    var name = match[1]
    var value = match[2]
    var dir = value === `/` ? root : join(root, value)
    options[name] = dir
  }
  return options
}

function setShortcuts(path) {
  if (!shortcuts[root]) {
    shortcuts[root] = getOptions(root)
  }
  return shortcuts[root]
}

function shortcutPath(path) {
  if (!root) return false
  var shortcut = path.match(/^\$[\w-]+/)[0]
  var dir = shortcuts[root][shortcut]
  return path.replace(shortcut, dir)
}

var Module = require(`module`)
var include = Module.prototype.require

Module.prototype.require = function(path) {
  var dir = path
  if (path[0] === `$`) dir = shortcutPath(path) || path
  return include.call(this, dir)
}

module.exports = setShortcuts()