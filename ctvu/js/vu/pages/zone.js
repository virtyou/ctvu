CT.require("CT.align");
CT.require("CT.data");
CT.require("CT.db");
CT.require("CT.dom");
CT.require("CT.file");
CT.require("CT.key");
CT.require("CT.layout");
CT.require("CT.modal");
CT.require("CT.parse");
CT.require("CT.storage");
CT.require("CT.trans");
CT.require("core");
CT.require("user.core");
CT.require("zero.core");
CT.require("vu.core");
CT.require("vu.color");
CT.require("vu.controls");
CT.require("vu.media");
CT.require("vu.party");
CT.require("vu.storage");
CT.require("vu.build");
CT.require("vu.menu.Map");
CT.require("vu.builders.core");
CT.require("vu.builders.zone");

CT.onload(function() {
	CT.initCore();
	vu.core.init();
	vu.storage.init(function() {
		// menus
		vu.builders.zone.menus();
		// virtual world
		vu.builders.core.init();
		// resources
		vu.media.init();
	}, true);
});