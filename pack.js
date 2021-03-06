
function prelude (content, deps, entry) {
  var cache = {}

  function load (file) {
    var d = deps[file]
    if(cache[file]) return cache[file]
    if(!d) return require(file)
    var fn = content[d[0]] //the actual module
    var module = {exports: {}, parent: file !== entry}
    fn(
      function (m) {
        //console.error('require', m, d[1][m])
        if(!d[1][m]) return require(m)
        else         return load (d[1][m])
      },
      module,
      module.exports,
      file.substring(file.lastIndexOf('/')),
      file
    )
    return cache[file] = module.exports
  }

  return load(entry)
}

module.exports = function (content, deps, entry) {
  return (
    '('+prelude.toString()+')('
    + (function () {
        var s = '{\n'
        for(var k in content) {
          s += [
            JSON.stringify(k)+':\n', 
            'function (require, module, exports, __dirname, __filename) {\n',
            content[k],
            '\n},\n'
          ].join('')
        }
        return s+'\n}\n'
      })()
    + ',\n'
    + JSON.stringify(deps, null, 2)
    + ',\n'
    + JSON.stringify(entry)
    + ')'
  )
}
