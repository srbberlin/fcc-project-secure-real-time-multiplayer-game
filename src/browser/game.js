//const { dim } = require("../dim")
const { Display } = require("./display")
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

if (localStorage.getItem("ownPlayer") === "undefined") {
  localStorage.setItem("ownPlayer", null)
}

const s = io()
let count

s.on("connect", () => {
  //console.log("Connetcted to the Server !\n", localStorage.ownPlayer);

  ownPlayer = localStorage.ownPlayer
  s.emit("id", ownPlayer)
  //console.log("id:sent: ", ownPlayer)
})

s.on("id", id => {
  ownPlayer = id
  localStorage.ownPlayer = id
  //console.log("id:received: ", id)
})

s.on("list", data => {
  //console.log("list:received: ", data)
  player_list = data
  display.draw(ownPlayer, player_list, collectible_list)
})

s.on("player", data => {
  //console.log("player:received", data)
  data.map(p => digest(player_list, p))
  display.draw(ownPlayer, player_list, collectible_list)
})

s.on("collectible", data => {
  //console.log("collectible:received", data)
  data.map(c => digest(collectible_list, data))
  display.draw(ownPlayer, player_list, collectible_list)
})

s.on("disconnect", data => {
  //console.log("disconnect:received", data)
})

document.onkeydown = e => {
  let dir = null
  switch (e.keyCode) {
    case 87:
    case 38:
      dir = 'up';
      break;
    case 83:
    case 40:
      dir = 'down';
      break;
    case 65:
    case 37:
      dir = 'left';
      break;
    case 68:
    case 39:
      dir = 'right';
      break;
  }

  if (dir) {
    //console.log("Hit:", e.keyCode, dir)
    s.emit("player", { dir, speed: 1 })
  }
}
