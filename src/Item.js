const { dim } = require('./dim')

exports.Item = class Item {

  static dim() { return dim }

  constructor({ type, x, y, r, id, act }) {
    this.type = type
    this.x = x
    this.y = y
    this.r = r
    this.id = id
    this.act = act
  }

  playing(arg = true) {
    this.act = arg
  }

  dist(o) {
    return Math.sqrt(Math.pow(this.x - o.x, 2) + Math.pow(this.y - o.y, 2))
  }
    
  collision(o) {
    if (this.id !== o.id) {
      const d = this.dist(o)
      const m = this.r + o.r

      if (d <= m) {
        if (o.type === 'C' && o.value > 0) {
          o.value -= 1
          this.score += 1
          dim.r(o)
          dim.r(this)
        }
        //console.log('\n  collision:', this.id, o.id, Math.floor(d), m)
        return true
      }
    }
    return false
  }
}