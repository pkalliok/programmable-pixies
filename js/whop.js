"use strict";
// vim:sw=2:

var whop = whop || (function () {

var node = document.createElement.bind(document);
var elem = document.getElementById.bind(document);

var holding_element;
var stage;

function array_of(len, producer) {
  return new Array(len+1).join('x').split('')
    .map(function(_, idx) { return producer(idx); });
}

function newStage() {
  return {
    sprites: [],
    keyHandlers: {},
    element: node('div')
  };
}

function installStage(new_stage) {
  if (stage) holding_element.removeChild(stage.element);
  stage = new_stage;
  holding_element.appendChild(stage.element);
}

function movenode(n, x, y) {
  n.style.left = x + 'px';
  n.style.top = y + 'px';
}

function resizenode(n, w, h) {
  n.style.width = w + 'px';
  n.style.height = h + 'px';
}

function img(stage, src, x, y) {
  var n = node('img');
  n.src = src;
  n.style.position = 'absolute';
  movenode(n, x, y);
  stage.element.appendChild(n);
  return n;
}

function makeTile(stage, pict, size, x, y, x_pos, y_pos) {
  var node = img(stage, pict, x_pos, y_pos);
  resizenode(node, size, size);
  var info = {};
  return {
    x: function getX() { return x; },
    y: function getY() { return y; },
    pict: function getPict() { return pict; },
    info: function getInfo() { return info; },
    setPict: function setPict(new_pict) {
      node.src = pict = new_pict;
    }
  };
}

function makeMap(w, h, tile_size, initialiser, x_off, y_off) {
  x_off = x_off || 0;
  y_off = y_off || 0;
  tile_size = tile_size || 32;
  initialiser = initialiser || function(x, y) { return null; };

  var map = array_of(w, function(x) {
    return array_of(h, function(y) {
      return makeTile(stage, initialiser(x, y), tile_size, x, y,
	  x_off + x * tile_size, y_off + y * tile_size);
    });
  });

  function tile(x, y) {
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x >= w) x = w - 1;
    if (y >= h) y = h - 1;
    return map[x][y];
  }

  function tileAt(x_pos, y_pos) {
    return tile(Math.floor((x_pos - x_off) / tile_size),
	Math.floor((y_pos - y_off) / tile_size));
  };

  return {
    w: function getWidth() { return w; },
    h: function getHeight() { return h; },
    tile: tile,
    tileAt, tileAt
  };

}

function makeSprite(src, x, y) {
  var xd = 0, yd = 0;
  var mystage = stage;
  var node = img(mystage, src, x, y);
  var hooks = [];
  var index_in_sprites = 0;

  function moveTo(nx, ny) {
    x = nx;
    y = ny;
    movenode(node, x, y);
  }

  function move(xd, yd) {
    moveTo(x + xd, y + yd);
  }

  var inst = {
    x: function getX() { return x; },
    y: function getY() { return y; },
    xSpeed: function getXSpeed() { return xd; },
    ySpeed: function getYSpeed() { return yd; },

    move: move,
    moveTo: moveTo,
    update: function update() {
      hooks = hooks.filter(function(hook) { return hook(); });
      move(xd, yd);
    },

    setDims: function setDims(nwidth, nheight) {
      resizenode(node, nwidth, nheight);
    },

    setPicture: function setPicture(url) {
      node.src = url;
    },

    setGhost: function setGhost(transparency) {
      if (transparency === 1) node.style.visibility = 'hidden';
      else {
	node.style.opacity = (1-transparency);
	node.style.visibility = 'visible';
      }
    },

    setSpeed: function setSpeed(nxd, nyd) { xd = nxd; yd = nyd; },
    accel: function accel(xdd, ydd) { inst.setSpeed(xd + xdd, yd + ydd); },
    whenMoved: function whenMoved(cb) { hooks.push(cb); },

    clear: function clear() {
      hooks = [];
      inst.setSpeed(0, 0);
    },

    destroy: function destroy() {
      delete mystage.sprites[index_in_sprites];
      node.parentElement.removeChild(node);
    }
  }

  index_in_sprites = mystage.sprites.push(inst) - 1;

  return inst;
}

function nextFrame() {
  stage.sprites.forEach(function(sprite) { sprite.update(); });
  requestAnimationFrame(nextFrame);
}

function handleKey(e) {
  var handler = stage.keyHandlers[e.keyCode];
  if (!handler) return true;
  handler();
  if (e.preventDefault) e.preventDefault();
  return false;
}

function whenPressed(c, f) {
  stage.keyHandlers[c.charCodeAt(0)] = f;
}

function installHandler(keyCode) {
  return function handleKey(f) {
    stage.keyHandlers[keyCode] = f;
  }
}

function initialise(stagename) {
  holding_element = elem(stagename);
  holding_element.removeChild(elem('jswarning'));
  installStage(newStage());
  document.onkeydown = handleKey;
  requestAnimationFrame(nextFrame);
}

return {
  initialise: initialise, init: initialise,
  makeSprite: makeSprite, spr: makeSprite,
  allSprites: function allSprites() { return stage.sprites; },
  curStage: function curStage() { return stage; },
  newStage: newStage,
  installStage: installStage, screen: installStage,
  makeMap: makeMap, map: makeMap,
  whenPressed: whenPressed, key: whenPressed,
  whenLeft: installHandler(37),
  whenUp: installHandler(38),
  whenRight: installHandler(39),
  whenDown: installHandler(40)
};

})();

