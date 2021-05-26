var game = (function () {
  'use strict';

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

  var dim_1 = {
    canvasWidth,
    canvasHeight,
    arenaSizeX,
    arenaSizeY,
    minX,
    minY,
    maxX,
    maxY,
    r: (o) => {
      if (o.type === "C") {
        o.r = minR + o.value;
      }
      else {
        o.r = minR + o.score * 5;
      }
    },
    c: (o) => {
      o.x = minX + o.r + Math.floor(Math.random() * (arenaSizeX - o.r));
      o.y = minY + o.r + Math.floor(Math.random() * (arenaSizeY - o.r));
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

      draw(id, player_list, collectible_list) {
          //console.log("Display.draw:", id)
          context.clearRect(0, 0, canvas.width, canvas.height);
          // Set background color
          context.fillStyle = '#1c4966';
          context.fillRect(0, 0, canvas.width, canvas.height);

          // Create border for play field
          context.strokeStyle = '#45b6fe';
          context.strokeRect(dim.minX, dim.minY, dim.arenaSizeX, dim.arenaSizeY);

          // Controls text
          context.fillStyle = '#45b6fe';
          context.font = `13px 'Press Start 2P'`;
          context.textAlign = 'center';
          context.fillText('Controls', 80, 20);
          context.textAlign = 'center';
          context.fillText('WASD', 80, 40);

          // Game title
          context.font = `40px 'Modak'`;
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

  //const { dim } = require("../dim")
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

  if (localStorage.getItem("ownPlayer") === "undefined") {
    localStorage.setItem("ownPlayer", null);
  }

  const s = io();

  s.on("connect", () => {
    //console.log("Connetcted to the Server !\n", localStorage.ownPlayer);

    ownPlayer = localStorage.ownPlayer;
    s.emit("id", ownPlayer);
    //console.log("id:sent: ", ownPlayer)
  });

  s.on("id", id => {
    ownPlayer = id;
    localStorage.ownPlayer = id;
    //console.log("id:received: ", id)
  });

  s.on("list", data => {
    //console.log("list:received: ", data)
    player_list = data;
    display.draw(ownPlayer, player_list, collectible_list);
  });

  s.on("player", data => {
    //console.log("player:received", data)
    data.map(p => digest(player_list, p));
    display.draw(ownPlayer, player_list, collectible_list);
  });

  s.on("collectible", data => {
    //console.log("collectible:received", data)
    data.map(c => digest(collectible_list, data));
    display.draw(ownPlayer, player_list, collectible_list);
  });

  s.on("disconnect", data => {
    //console.log("disconnect:received", data)
  });

  document.onkeydown = e => {
    let dir = null;
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
      s.emit("player", { dir, speed: 1 });
    }
  };

  var game = {

  };

  return game;

}());
