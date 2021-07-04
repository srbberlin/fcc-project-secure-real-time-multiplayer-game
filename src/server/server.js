require('dotenv').config() // TEST

const pub = process.cwd() + '/public'
const assets = process.cwd() + '/assets'

const express = require('express')
const helmet = require('helmet')
const nocache = require('nocache')
const socket = require('socket.io')

//const livereload = require('livereload')
//const connectLiveReload = require('connect-livereload')
//const liveReloadServer = livereload.createServer()

const fccTestingRoutes = require('./routes/fcctesting.js')
const runner = require('./test-runner.js')

const app = express()

app.use('/public', express.static(pub))
app.use(express.static(assets))

//liveReloadServer.watch(pub)

//app.use(connectLiveReload())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(nocache())
app.use(function (req, res, next) {
  res.setHeader('X-Powered-By', 'PHP 7.4.3')
  next()
})


// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html')
  })

//For FCC testing purposes
fccTestingRoutes(app)

// 404 Not Found Middleware
app.use(function (req, res) {
  console.log('404: ', `${req.client.remoteAddress}:${req.client.remotePort} -> ${req.url}`)
  res.status(404)
    .type('text')
    .send('Not Found')
})

const portNum = process.env.PORT || 3000

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(
    '\n================= HTTP Server connected =================\n',
    ` Listening on port ${portNum}`)
  //liveReloadServer.server.once("connection", () => {
  //  console.log('  LiveReload connected !')
  //});

  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...')
    setTimeout(function () {
      try {
        runner.run()
      } catch (error) {
        console.log('Tests are not valid:')
        console.error(error)
      }
    }, 1500)
  }
})

const { CollectibleList, PlayerList, List } = require('./List')
const playerList = new PlayerList()
const collectibleList = new CollectibleList()
const list = new List()

const { Player } = require('./Player')
const { Collectible } = require('./Collectible')

const io = socket(server)
let collectible

io.on('connection', (s) => {
  console.log('\n================== IO Server connected ==================\n')
  let player

  s.on('id', (id) => {
    let o1, o2, ll

    console.log('  received id: ', id)

    s.myId = id
    o1 = list.all('C')[0]
    if (o1 === undefined) {
      o1 = new Collectible({ x: 0, y: 0, r: 10, value: 10, id: 'C:' + s.id, act: true })
      if (collectibleList.add(o1)) {
        console.log('New Collectible: ', o1.id)
      }
    }

    o2 = playerList.find(id)
    if (o2 === undefined) {
      o2 = new Player({ x: 0, y: 0, r: 10, score: 0, id: 'P:' + s.id, act: true })
      if (playerList.add(o2)) {
        console.log('New Player: ', o2.id)
        s.emit('id', o2.id)
      }
    }

    o1.playing()
    o2.playing()

    s.myId = id
    ll = list.activated()
    ll.forEach(ox => console.log('  sent list: initial', ox.id))
    //io.allSockets().then(a => console.log(a))
    io.emit('list', { d: ll })
    collectible = o1
    player = o2
  })

  s.on('player', d => {
    //console.log("  received player: ", player.id, d.dir, d.speed)
    player.movePlayer(d.dir, d.speed)

    let ll, o3 = list.collision(player)
    if (o3) {
      if (o3.type === 'P' || o3.value > 0) {
        list.replace(o3) // TODO: what if this fails ?
        ll = [player]
        if (o3.act) {
          ll.push(o3)
        }
        ll.forEach(ox => console.log('  sent player: replace', ox.id, ox.x, ox.y, ox.type === 'C' ? ox.value : ox.score))
        io.emit('player', { d: ll })
      }
      else {
        list.reset()
        ll = list.activated()
        ll.forEach(ox => console.log('  sent list: reset', ox.id, ox.x, ox.y, ox.type === 'C' ? ox.value : ox.score))
        io.emit('list', { d: ll })
      }
    }
    else {
      console.log('  sent player: moved', player.id)
      io.emit('player', { d: [player] })
    }
  })

  s.on('collectible', d => {
    io.emit('collectible', [collectible])
    console.log('collectible: ', d, player)
  })

  s.on('disconnect', (reason) => {
    console.log(
      '\n================ IO Server disconnected =================\n',
      ` Reason: ${reason}`)
    list.save()
  })
})

function signalHandler() {
  console.log('Caught interrupt signal')
  list.deactivateAll()
  list.save()
  io.emit('list', { d:[] })
  io.close()

  process.exit()
}

process.on('SIGINT', function () {
  signalHandler()
})

process.on('SIGTERM', function () {
  signalHandler()
})

module.exports = app // For testing
