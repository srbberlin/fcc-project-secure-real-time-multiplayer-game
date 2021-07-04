const { dim } = require('./dim')
const { Item } = require('./Item')

exports.Collectible = class Collectible extends Item {
  constructor({ x, y, r, value, id, act }) {
    super({ type: 'C', x, y, r, id, act })
    this.value = value
    dim.r(this)
  }
}

