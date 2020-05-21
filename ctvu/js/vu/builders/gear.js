vu.builders.Gear = CT.Class({
	CLASSNAME: "vu.builders.Gear"
}, vu.menu.Body);

vu.builders.gear = {
	menus: function() {
		vu.builders.gear = new vu.builders.Gear({
			main: "gear"
		});
	}
};