CT.require("CT.align");
CT.require("CT.data");
CT.require("CT.db");
CT.require("CT.dom");
CT.require("CT.key");
CT.require("CT.layout");
CT.require("CT.modal");
CT.require("CT.parse");
CT.require("CT.pubsub");
CT.require("CT.storage");
CT.require("CT.trans");
CT.require("core");
CT.require("user.core");
CT.require("zero.core");
CT.require("vu.core");
CT.require("vu.color");
CT.require("vu.controls");
CT.require("vu.storage");
CT.require("vu.live");
CT.require("vu.party");
CT.require("vu.portal");
CT.require("vu.menu.Map");
CT.require("vu.builders.core");
CT.require("vu.builders.play");
CT.scriptImport("CT.lib.colorPicker");

CT.onload(function() {
	CT.initCore();
	vu.core.init();
	vu.storage.init(function() {
		// menu
		vu.builders.play.menus();
		// virtual world
		vu.builders.core.init();
	}, true);
});