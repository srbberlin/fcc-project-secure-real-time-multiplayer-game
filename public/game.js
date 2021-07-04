var game = (function () {
  'use strict';

  const scoreInit = 0;
  const valueInit = 10;
  const rFactor = 5;

  const canvasWidth = 640;
  const canvasHeight = 480;
  const border = 10;
  const title = 50;
  const arenaSizeX = canvasWidth - 2 * border;
  const arenaSizeY = canvasHeight - 2 * border - title;
  const minX = border;
  const minY = border + title;
  const maxX = canvasWidth - border;
  const maxY = canvasHeight - border;
  const minR = 10;
  const maxR = valueInit * rFactor + 4;

  var dim_1 = {
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
        o.r = minR + o.value * rFactor;
      }
      else {
        o.r = minR + o.score * rFactor;
      }
    },
    c: (o) => {
      //o.x = minX + o.r + 5 + Math.floor(Math.random() * (arenaSizeX - 2 * (o.r - 5)))
      //o.y = minY + o.r + 5 + Math.floor(Math.random() * (arenaSizeY - 2 * (o.r - 5)))
      o.x = minX + maxR + 5 + Math.floor(Math.random() * (arenaSizeX - 2 * (maxR - 5)));
      o.y = minY + maxR + 5 + Math.floor(Math.random() * (arenaSizeY - 2 * (maxR - 5)));
    },
    m : (o, dir, speed) => {
      if (o.type === 'P') {
        //const lAdd = o.r + 3 // avoid touching the border ...
        const lAdd = maxR + 3; // avoid touching the border ...
        const lMaxX = maxX - lAdd;
        const lMinX = minX + lAdd;
        const lMaxY = maxY - lAdd;
        const lMinY = minY + lAdd;
    
        if (dir === 'right') {
          o.x += speed;
          if (o.x > lMaxX)
            o.x = lMaxX;
        }
        else if (dir === 'down') {
          o.y += speed;
          if (o.y > lMaxY)
            o.y = lMaxY;
        }
        else if (dir === 'left') {
          o.x -= speed;
          if (o.x < lMinX)
            o.x = lMinX;
        }
        else if (dir === 'up') {
          o.y -= speed;
          if (o.y < lMinY)
            o.y = lMinY;
        }      }
    }
  };

  var dim$1 = {
  	dim: dim_1
  };

  const { dim } = dim$1;

  const canvas = document.getElementById('game-window');
  const context = canvas.getContext('2d');

  var Display_1 = class Display {
    constructor() {
      this.playerMe = new Image();
      this.playerOther = new Image();
      this.collectible = new Image();

      this.playerMe.src = 'green.png';
      this.playerOther.src = 'white.png';
      this.collectible.src = 'oxygen.png';
    }

    draw(id, rank, player_list, collectible_list) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Create border for play field
      context.strokeStyle = '#45b6fe';
      context.strokeRect(dim.minX, dim.minY, dim.arenaSizeX, dim.arenaSizeY);

      // Controls text
      context.fillStyle = '#45b6fe';
      context.font = '13px sans-serif';//`13px 'Press Start 2P'`;
      context.textAlign = 'center';

      context.fillText('Controls', 80, 20);
      context.fillText('WASD', 80, 40);
      context.fillText(rank, 550, 40);

      // Game title
      context.font = '40px serif';//`40px 'Modak'`;
      context.fillText('Bubble survivor', 300, 40);

      player_list.map(o => {
        let f, x = o.x, y = o.y, r = o.r;
        if (o.type === 'C') {
          f = this.collectible;
        }
        else {
          if (o.id === id) {
            f = this.playerMe;
          }
          else {
            f = this.playerOther;
          }
        }
        context.drawImage(
          f,
          x - r,
          y - r,
          2 * r, 2 * r
        );
      });
    }
  };

  var display$1 = {
  	Display: Display_1
  };

  const { Display } = display$1;
  const display = new Display();

  let ownPlayer, player_list;
  let collectible_list;

  function digest(list, o) {

    let ol = list.find(ot => o.id === ot.id);
    //console.log("digest", o.id)

    if (ol) {
      if (ol.del) {
        list = list.filter(ol => o.id !== ol.id);
      }
      else {
        Object.assign(ol, o);
      }
    }
    else {
      list.push(o);
    }
  }

  function calculateRank(id, arr) {
    console.log('calculateRank:', id);

    let position = 0;
    let length = 0;

    if (arr.length) {
      let sorted = arr.filter(o1 => o1.type === 'P').sort((a, b) => b.score - a.score);
      let o1 = sorted[0];
      let index = 1;

      length = sorted.length;
      position++;
    
      while (id !== o1.id) { console.log(' ------------------------->');
        let o2 = sorted[index++];
        if (o1.score != o2.score) {
          position++;
        }
        o1 = o2;
      }
    }

    return `Rank: ${position} / ${length}`
  }

  if (localStorage.getItem('ownPlayer') === 'undefined') {
    localStorage.setItem('ownPlayer', null);
  }

  const s = io();

  s.on('connect', () => {
    //console.log("Connetcted to the Server !\n", localStorage.ownPlayer);

    ownPlayer = localStorage.ownPlayer;
    s.emit('id', ownPlayer);
    //console.log("id:sent: ", ownPlayer)
  });

  s.on('id', id => {
    ownPlayer = id;
    localStorage.ownPlayer = id;
    //console.log("id:received: ", id)
  });

  s.on('list', o => {
    console.log('list:received: ', o);
    player_list = o.d;
    display.draw(ownPlayer, calculateRank(ownPlayer, player_list), player_list, collectible_list);
  });

  s.on('player', o => {
    //console.log("player:received", o)
    o.d.map(p => digest(player_list, p));
    display.draw(ownPlayer, calculateRank(ownPlayer, player_list), player_list, collectible_list);
  });

  s.on('collectible', o => {
    //console.log("collectible:received", o)
    o.d.map(c => digest(collectible_list, c));
    display.draw(ownPlayer, calculateRank(ownPlayer, o.d), player_list, collectible_list);
  });

  s.on('disconnect', data => {
    //console.log("disconnect:received", data)
  });

  document.onkeydown = e => {
    let dir = null;
    switch (e.keyCode) {
    case 87:
    case 38:
      dir = 'up';
      break
    case 83:
    case 40:
      dir = 'down';
      break
    case 65:
    case 37:
      dir = 'left';
      break
    case 68:
    case 39:
      dir = 'right';
      break
    }

    if (dir) {
      //console.log("Hit:", e.keyCode, dir)
      s.emit('player', { dir, speed: 10 });
    }
  };

  var game = {

  };

  return game;

}());
