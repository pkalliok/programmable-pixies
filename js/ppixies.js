"use strict";

var ppixies = ppixies || (function () {

var image_names =
	[[" ", "grass"], "flowers",
	"treebot", ["t", "treeover"], "treegap", "treetop"];

var img = R.fromPairs(R.chain(function (name) {
	if ((typeof name) !== "string") {
		var abbr = name[0];
		name = name[1];
	}
	var file = "img/tile-" + name + ".png";
	return [[abbr, file], [name, file]];
}, image_names));

var worlds = {
1: ["ttttttttttttttt",
    "ttttttttttttttt",
    "t         ttttt",
    "t  ttt       tt",
    "t  ttt    tt tt",
    "t  ttt    tt tt",
    "t         tt tt",
    "t  ttt    tt tt",
    "t  ttt    tt tt",
    "t  ttt    tt   ",
    "t         ttttt",
    "ttttttttttttttt",
    "ttttttttttttttt"]
};

function world_to_map(num) {
	var world = worlds[num];
	var height = world.length;
	var width = R.reduce(R.max, 0, R.map(R.prop('length'), world));
	return whop.makeMap(width, height, 32, function(x, y) {
		return img[world[y].charAt(x)];
	});
}

function crossmap(f, ls1, ls2) {
	return R.chain(function (e1) {
		return R.map(function (e2) {
			return f(e1, e2);
		}, ls2);
	}, ls1);
}

function map_update(f, map) {
	var newmap = crossmap(function (x, y) {
		function offset_tile(dx, dy) { return map.tile(x + dx, y + dy); }
		return [x, y, f(offset_tile)];
	}, R.range(0, map.w()), R.range(0, map.h()));
	newmap.forEach(function (update) {
		map.tile(update[0], update[1]).setPict(update[2]);
	});
}

function prob(p) {
	return Math.random() < p;
}

function choose_tile(tileAt) {
	return {
		"img/tile-grass.png": function grass() {
			if (prob(.2)) return img.flowers;
			return img.grass;
		},
		"img/tile-treeover.png": function tree() {
			if (tileAt(0, -1).pict() === "img/tile-grass.png")
				return img.treetop;
			if (tileAt(0, 1).pict() === "img/tile-grass.png")
				return img.treebot;
			if (prob(.2)) return img.treegap;
			return img.treeover;
		}
	}[tileAt(0, 0).pict()]();
}

return { choose_tile, map_update, world_to_map };

})();
