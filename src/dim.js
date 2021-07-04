const scoreInit = 0
const valueInit = 10
const rFactor = 5

const canvasWidth = 640
const canvasHeight = 480
const border = 10
const title = 50
const arenaSizeX = canvasWidth - 2 * border
const arenaSizeY = canvasHeight - 2 * border - title
const minX = border
const minY = border + title
const maxX = canvasWidth - border
const maxY = canvasHeight - border
const minR = 10
const maxR = valueInit * rFactor + 4

module.exports.dim = {
  canvasWidth,
  canvasHeight,
  arenaSizeX,
  arenaSizeY,
  scoreInit,
  valueInit,
  minX,
  minY,
  maxX,
  maxY,
  r: (o) => {
    if (o.type === 'C') {
      o.r = minR + o.value * rFactor
    }
    else {
      o.r = minR + o.score * rFactor
    }
  },
  c: (o) => {
    //o.x = minX + o.r + 5 + Math.floor(Math.random() * (arenaSizeX - 2 * (o.r - 5)))
    //o.y = minY + o.r + 5 + Math.floor(Math.random() * (arenaSizeY - 2 * (o.r - 5)))
    o.x = minX + maxR + 5 + Math.floor(Math.random() * (arenaSizeX - 2 * (maxR - 5)))
    o.y = minY + maxR + 5 + Math.floor(Math.random() * (arenaSizeY - 2 * (maxR - 5)))
  },
  m : (o, dir, speed) => {
    if (o.type === 'P') {
      //const lAdd = o.r + 3 // avoid touching the border ...
      const lAdd = maxR + 3 // avoid touching the border ...
      const lMaxX = maxX - lAdd
      const lMinX = minX + lAdd
      const lMaxY = maxY - lAdd
      const lMinY = minY + lAdd
  
      if (dir === 'right') {
        o.x += speed
        if (o.x > lMaxX)
          o.x = lMaxX
      }
      else if (dir === 'down') {
        o.y += speed
        if (o.y > lMaxY)
          o.y = lMaxY
      }
      else if (dir === 'left') {
        o.x -= speed
        if (o.x < lMinX)
          o.x = lMinX
      }
      else if (dir === 'up') {
        o.y -= speed
        if (o.y < lMinY)
          o.y = lMinY
      }      }
  }
}
