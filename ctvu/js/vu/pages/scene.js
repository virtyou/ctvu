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
CT.require("vu.media");
CT.require("vu.audio");
CT.require("vu.storage");
CT.require("vu.controls");
CT.require("vu.game.util");
CT.require("vu.game.step");
CT.require("vu.game.stepper");
CT.require("vu.builders.scene");

CT.onload(function() {
	CT.initCore();
	vu.core.init();
	vu.storage.init(vu.builders.scene.menus, true);
});