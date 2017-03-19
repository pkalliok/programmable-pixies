"use strict";
// vim:sw=2:

var whop = whop || (function () {

var node = document.createElement.bind(document);
var elem = document.getElementById.bind(document);

var holding_element;
var stage;

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
  whenPressed: whenPressed, key: whenPressed,
  whenLeft: installHandler(37),
  whenUp: installHandler(38),
  whenRight: installHandler(39),
  whenDown: installHandler(40)
};

})();

