CT.require("CT.align");
CT.require("CT.data");
CT.require("CT.db");
CT.require("CT.dom");
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
CT.require("vu.controls");
CT.require("vu.storage");
CT.require("vu.builders.game");

CT.onload(function() {
	CT.initCore();
	vu.core.init();
	vu.storage.init(vu.builders.game.menus, true);
});