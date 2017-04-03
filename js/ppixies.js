"use strict";

var ppixies = ppixies || (function () {

function img(name) { return "img/tile-" + name + ".png"; }

var terrains = { " ": "grass", "t": "tree" };

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

function get_world(num) {
	var world = worlds[num];
	return function terrainAt(x, y) {
		if (y < 0 || y >= world.length || x < 0 || x >= world[y].length)
			return "nothing";
		return terrains[world[y].charAt(x)];
	};
}

function world_cobind(f, world) {
	return R.memoize(function terrainAt(x, y) {
		function offset_terrainAt(dx, dy) { return world(x + dx, y + dy); }
		return f(offset_terrainAt);
	});
}

function prob(p) {
	return Math.random() < p;
}

function choose_tile(terrainAt) {
	return {
		grass: function grass() {
			if (prob(.2)) return "flowers";
			return "grass";
		},
		nothing: function nothing() { return "treeover"; },
		tree: function tree() {
			if (terrainAt(0, -1) === "grass") return "treetop";
			if (terrainAt(0, 1) === "grass") return "treebot";
			if (prob(.2)) return "treegap";
			return "treeover";
		}
	}[terrainAt(0, 0)]();
}

var smooth_terrains = R.partial(world_cobind, [choose_tile]);

function world_to_map(world, width, height) {
	return whop.makeMap(width, height, 32, function (x, y) {
		return img(world(x, y));
	});
}

function show_world(num) {
	var height = worlds[num].length;
	var width = R.reduce(R.max, 0, R.map(R.prop('length'), worlds[num]));
	return world_to_map(smooth_terrains(get_world(num)), width, height);
}

return show_world;

})();
