const js = require('jsonfile')
const { Collectible } = require('./Collectible')
const { Player } = require('./Player')
const { dim } = require('./dim')

let list = []
let url

function file() {
  js.readFile(url, (err, data) => {
    if (err) {
      saveFile()
    }
    else {
      list = data.map(
        o => o.type === 'P' ?
          new Player(o) :
          new Collectible(o)
      )
    }
  })
}

function saveFile() {
  //console.log("saveFile:", url, list)
  js.writeFileSync(url, list)
}

class List {

  constructor(u = process.cwd() + '/list.json') {
    url = u
    file()
  }

  add(o) {
    let l = list.length

    if (l > 10) {
      return false
    }
    this.replace(o)
    list.push(o)
    //saveFile()
    return true
  }

  remove(id) {
    list = list.filter(o => o.id !== id)
    //saveFile()
  }

  find(id) {
    return list.find(o => o.id === id)
  }

  all(type = null, act = false) {
    return type ?
      list.filter(o => o.type === type && act === false || o.act ) :
      list
  }

  activated() {
    return list.filter(o => o.act === true)
  }

  replace(o) {
    let c = 0
    do {
      if (++c >= 10) {
        return false
      }
      dim.c(o)
    }
    while (this.collision(o))
    //saveFile()
    return true
  }

  /*
      Detect the first collision.
      The provided objet's collision() will be called
      for every member in the list.
  */

  collision(o) {
    const o2 = list.find(o1 => o.collision(o1))
    //if (o2) {
    //  saveFile()
    //}
    return o2
  }

  reset() {
    for(const o of list) {
      o.x = o.y = 0
    }
    for(const o of list) {
      if (o.type === 'C') {
        o.value = dim.valueInit
      }
      else {
        o.score = dim.scoreInit
      }
      dim.r(o)
      this.replace(o)
    }
    saveFile()
  }

  deactivateAll() {
    list.forEach(o => {
      o.playing(false)
    })
    //saveFile()
  }

  save() { saveFile() }
}

exports.List = List

exports.PlayerList = class PlayerList extends List {
  //constructor() { super() }
}

exports.CollectibleList = class CollectibleList extends List {
  //constructor() { super() }
}
