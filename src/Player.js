const { dim } = require('./dim')
const { Item } = require('./Item')

exports.Player = class Player extends Item {
  constructor({ x, y, r, score, id, act }) {
    super({ type: 'P', x, y, r, id, act })
    this.score = score
    dim.r(this)
  }

  movePlayer(dir, speed) {
    dim.m(this, dir, speed)
  }

  calculateRank(arr) {
    const sort = arr.sort((a, b) => b.score - a.score)
    let position = 0
    sort.forEach((player, index) => {
      if (this.id === player.id) position = index + 1
    })

    return `Rank: ${position} / ${arr.length}`
  }
}
