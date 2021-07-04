const { dim } = require('../dim')

const canvas = document.getElementById('game-window')
const context = canvas.getContext('2d')

exports.Display = class Display {
  constructor() {
    this.playerMe = new Image()
    this.playerOther = new Image()
    this.collectible = new Image()

    this.playerMe.src = 'green.png'
    this.playerOther.src = 'white.png'
    this.collectible.src = 'oxygen.png'
  }

  draw(id, rank, player_list, collectible_list) {
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Create border for play field
    context.strokeStyle = '#45b6fe'
    context.strokeRect(dim.minX, dim.minY, dim.arenaSizeX, dim.arenaSizeY)

    // Controls text
    context.fillStyle = '#45b6fe'
    context.font = '13px sans-serif'//`13px 'Press Start 2P'`;
    context.textAlign = 'center'

    context.fillText('Controls', 80, 20)
    context.fillText('WASD', 80, 40)
    context.fillText(rank, 550, 40)

    // Game title
    context.font = '40px serif'//`40px 'Modak'`;
    context.fillText('Bubble survivor', 300, 40)

    player_list.map(o => {
      let f, x = o.x, y = o.y, r = o.r
      if (o.type === 'C') {
        f = this.collectible
      }
      else {
        if (o.id === id) {
          f = this.playerMe
        }
        else {
          f = this.playerOther
        }
      }
      context.drawImage(
        f,
        x - r,
        y - r,
        2 * r, 2 * r
      )
    })
  }
}
