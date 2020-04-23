vu.builders.Mod = CT.Class({
	CLASSNAME: "vu.builders.Mod",
	loadMain: function() {

	}
}, vu.menu.Body);

vu.builders.mod = {
	menus: function() {
		vu.builders.mod = new vu.builders.Mod({
			main: "mods",
			topright: "spine"
		});
	}
};