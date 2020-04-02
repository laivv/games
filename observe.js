var observe = function(){

    function defineObject(obj, key, watcher, keyPath) {
      var value = obj[key]
      Object.defineProperty(obj, key, {
        get: function() {
          return value
        },
        set: function(val) {
          if (value === val) {
            return
          }
          var oldValue = value
          value = val
          notify(watcher, keyPath, val, oldValue)
        }
      })
    }

    function defineArray(array, watcher, keyPath){
      var push = [].push
      var splice = [].splice
      array.push = function(){
        var oldValue = array.slice(0)
        push.apply(array, arguments)
        var newVal = array.slice(0)
        var args = [].slice.call(arguments, 0)
        observe(args, watcher, keyPath)
        notify(watcher, keyPath, newVal, oldValue)
      }
      array.splice = function(){
        var oldValue = array.slice(0)
        splice.apply(array, arguments)
        var newVal = array.slice(0)
        notify(watcher, keyPath, newVal, oldValue)
      }
    }

    var notify = function(){
      var timer = null
      var queue = {}
      return function(watcher, keyPath, val, oldValue){
          queue[keyPath] = { val, oldValue }
          if(timer){
            clearTimeout(timer)
            timer = null
          }
          timer = setTimeout(function(){
            for (var keyPath in queue){
              if(queue.hasOwnProperty(keyPath)){
                const {val , oldValue} = queue[keyPath]
                watcher && watcher(keyPath, val, oldValue)
              }
            }
            queue = {}
          },0)
      }
    }()

  function observe(obj, watcher, keyPath) {
    if (Object.prototype.toString.call(obj) !== '[object Object]' && Object.prototype.toString.call(obj) !== '[object Array]') { 
      return obj
    }
    var isRoot = !keyPath
    var rootPath = keyPath
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (isRoot) {
          keyPath = key
        } else {
          keyPath = rootPath + '.' + key
        }
        if(Object.prototype.toString.call(obj) === '[object Object]'){
          defineObject(obj, key, watcher, keyPath)
        }
        else if(Object.prototype.toString.call(obj) === "[object Array]"){
          defineArray(obj, watcher, keyPath)
        }
        
        if (Object.prototype.toString.call(obj[key]) === '[object Object]' || Object.prototype.toString.call(obj[key]) === '[object Array]') {
          observe(obj[key], watcher, keyPath)
        }
      }
    }
    return obj
  }

  return  function (obj, watcher) {
    return observe(obj, watcher, false);
  }

}()
