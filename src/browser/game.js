const { Display } = require('./display')
const display = new Display()

let ownPlayer, player_list
let collectible_list

function digest(list, o) {

  let ol = list.find(ot => o.id === ot.id)
  //console.log("digest", o.id)

  if (ol) {
    if (ol.del) {
      list = list.filter(ol => o.id !== ol.id)
    }
    else {
      Object.assign(ol, o)
    }
  }
  else {
    list.push(o)
  }
}

function calculateRank(id, arr) {
  console.log('calculateRank:', id)

  let position = 0
  let length = 0

  if (arr.length) {
    let sorted = arr.filter(o1 => o1.type === 'P').sort((a, b) => b.score - a.score)
    let o1 = sorted[0]
    let index = 1

    length = sorted.length
    position++
  
    while (id !== o1.id) { console.log(' ------------------------->')
      let o2 = sorted[index++]
      if (o1.score != o2.score) {
        position++
      }
      o1 = o2
    }
  }

  return `Rank: ${position} / ${length}`
}

if (localStorage.getItem('ownPlayer') === 'undefined') {
  localStorage.setItem('ownPlayer', null)
}

const s = io()

s.on('connect', () => {
  //console.log("Connetcted to the Server !\n", localStorage.ownPlayer);

  ownPlayer = localStorage.ownPlayer
  s.emit('id', ownPlayer)
  //console.log("id:sent: ", ownPlayer)
})

s.on('id', id => {
  ownPlayer = id
  localStorage.ownPlayer = id
  //console.log("id:received: ", id)
})

s.on('list', o => {
  console.log('list:received: ', o)
  player_list = o.d
  display.draw(ownPlayer, calculateRank(ownPlayer, player_list), player_list, collectible_list)
})

s.on('player', o => {
  //console.log("player:received", o)
  o.d.map(p => digest(player_list, p))
  display.draw(ownPlayer, calculateRank(ownPlayer, player_list), player_list, collectible_list)
})

s.on('collectible', o => {
  //console.log("collectible:received", o)
  o.d.map(c => digest(collectible_list, c))
  display.draw(ownPlayer, calculateRank(ownPlayer, o.d), player_list, collectible_list)
})

s.on('disconnect', data => {
  //console.log("disconnect:received", data)
})

document.onkeydown = e => {
  let dir = null
  switch (e.keyCode) {
  case 87:
  case 38:
    dir = 'up'
    break
  case 83:
  case 40:
    dir = 'down'
    break
  case 65:
  case 37:
    dir = 'left'
    break
  case 68:
  case 39:
    dir = 'right'
    break
  }

  if (dir) {
    //console.log("Hit:", e.keyCode, dir)
    s.emit('player', { dir, speed: 10 })
  }
}
