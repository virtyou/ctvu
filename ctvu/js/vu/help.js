vu.help = {
	sections: {
        talk: "Use the talk page to teach your characters how to have a conversation. At the bottom of the screen is a depiction of the full brachiated chronology, which is a tree consisting of verbal triggers. On the left are controls for adding new triggers (or modifying existing ones) to the current branch (or moving between [or creating new] branches), as well as for specifying verbal and emotional responses (as well as mods, gestures, dances, vibes, sound effects, etc etc etc). All avatars start with an 'unintelligible' trigger, which is called upon whenever we can't understand what you're saying. Use '*' for your fallback response.",
        tweak: "Use the tweak page to modify your characters' appearance. Click any body part to swap textures or adjust color, specular, shininess, or opacity. Change up your hair (use a hair model, or [custom or preconfigured] procedurally-generated hair, or no hair at all!) or beard (same rules as hair). Apply head and body morphs.",
        test: "Test various things about your characters on the test page. This includes the conversational triggers you specified on the talk page, the vibes (mood vector configurations) you crafted on the vibe page, the gestures and dances you created on the gesture page, and the mods you built on the mod page.",
        vibe: "Create mood configurations (vibes) on the vibe page. Each vibe consists of a specific value for each of 8 mood vectors. Modify your default vibe, tweak your 6 basic preconfigured vibes (suspicious, worried, mad, curious, sad, happy), and make up some new ones. Go wild!",
        mod: "Morph it up on the mod page. Create as many named mods as you want, including (if you want) a default (which is automatically applied). Each mod is a collection of bone scales. So you could have giant hands and a tiny head, or, you know, whatever you want. Use the far cam to mess with legs. Use the near cam to mess with arms.",
        gesture: "Choreograph gestures and dances on the gesture page. Each gesture is some combination of joint rotations. Each dance is some combination of gestures, along with an interval. Use the near cam to mess with arms and the spine. Use the far cam to mess with legs and dances. You start with basic (crappy) gestures for jump, left, and right, as well as a basic walk consisting of left and right (gestures).",
        zone: "Build, furnish, and connect zones on the zone page. Use the left menu to swap in a new shell, change your wallpaper, or mess with scale, friction, color, specular, and shininess. Use the Lights menu, on the right, to add/remove/adjust lights (variety, position, direction, color, intensity). Click 'Lights' (at the top of the Lights menu) to swap in the Furnishings menu, where you can add/remove furnishings, posters, portals, and video screens, and adjust their basic properties (position, scale, color, specular, shininess). The Furnishings menu also supports portal linkages for connecting your zones to the rest of the world. The Portal Requests menu, at the bottom, is for approving/denying incoming portal requests.",
        pop: "Add flora, fauna, and programmable automatons to your zones!",
        item: "Upload, skin, and scale your 3d models on the item page. Various stripset formats are supported - we recommend .obj files. Which 'kind' you select determines how you can use your object. For instance, 'held' and 'worn_' (worn_head, worn_finger, worn_knee, etc) kind objects may be used on the gear page to dress up your avatar. Objects of other kinds, such as 'shell' and 'wallpaper' (as well as furnishing, poster, and portal), can be loaded up in zones on the zone page. And 'hair', 'beard', 'eye' etc objects can be applied to your avatar on the tweak page.",
        gear: "Outfit your avatars on the gear page. Use the near cam for arms and spine. Use the far cam for legs and held items.",
        game: "Make a game on the game (make) page! Name and describe it. Add scenes. Specify initial, victory, and defeat conditions. Toggle live flag to list/unlist your game on the games page. Click a scene to launch the scene editor.",
        scene: "Build a scene on the scene (make) page! At the top right, you can register Props (furnishings already in the room) and add/position Items (usable game objects). Click 'Props' (at the top of the menu) to swap in the Portals menu, which is used to establish scene linkages. The top left menu has lighting controls and a script registry (including controls for adding/removing/renaming scripts). The Steps menu, at the bottom left, can be used to program each script as a series of steps, each step consisting of some combination of directives (directive varieties include lights, camera, action, state, scene, story, text, logic, pause, fx, music, and ambient). Use the Actors menu (at the bottom right) to add, describe, and position (initial) the scene's actors.",
        play: "Walk around the world on the explore page, and hang out with the other players. Features basic test page menus: Triggers and Vibes, bottom left; Gestures and Dances, bottom right; Mods, top right. Also includes Chat menu at the bottom and Run Home button at the top (only visible when you're away from your home room). Anything you say or do is relayed to anyone else nearby, so play responsibly!",
        games: "Check out the games folks have made on the games page. The really cool thing is that as you play through a game, anyone involved in the creation of any aspect (interactional/environmental/musical/personal/etc) of the experience is compensated through carecoin!",
        profile: "The profile page has some basic profile stuff, as well as a little widget for associating your carecoin account. If you do this, you'll be compensated whenever anyone interacts (in a game etc) with something you made.",
        adventure: "Move your character around with WASD. Jump with SPACE. Run with SHIFT. Open doors with ENTER. Adjust the camera with the ARROW keys. Click a person or object to interact. Basic (most useful) camera controls in bottom-right corner.",
        arcraft: "Design augmented reality experiences!",
        chat: "Catch up with your buds!"
	},
	p2n: {
		play: "explore (play)",
		scene: "scene (make)",
		game: "game (make)",
		arcraft: "ar (arcraft)"
	},
	full: function() {
		var h = vu.help;
		CT.modal.modal(Object.keys(h.sections).map(h.one));
	},
	one: function(p) {
		var h = vu.help;
		return [
			CT.dom.div((h.p2n[p] || p) + " page", "big centered"),
			CT.dom.div(h.sections[p], "bottompadded")
		];
	},
	page: function() {
		var p = location.pathname.split("/").pop().split(".")[0],
			h = vu.help, m, cont;
		if (!(p in h.sections))
			return h.full();
		cont = h.one(p);
		cont.unshift(CT.dom.link("more help", function() {
			m.hide();
			vu.help.full();
		}, null, "abs ctl"));
		m = CT.modal.modal(cont);
	}
};