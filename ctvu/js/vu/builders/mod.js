vu.builders.Mod = CT.Class({
	CLASSNAME: "vu.builders.Mod",
	neutral: 1
}, vu.menu.Joints);

vu.builders.mod = {
	menus: function() {
		vu.builders.mod = new vu.builders.Mod({
			main: "mods"
		});
	}
};