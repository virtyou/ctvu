vu.builders.Gear = CT.Class({
	CLASSNAME: "vu.builders.Gear",
	neutral: 1
}, vu.menu.Body);

vu.builders.gear = {
	menus: function() {
		vu.builders.gear = new vu.builders.Gear({
			main: "gear"
		});
	}
};