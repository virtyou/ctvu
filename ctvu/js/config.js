{
    "access" : {
        "anon": true,
        "avanon": ["play", "adventure"]
    },
    "storage": {
        "mode": "local",
        "apikey": "APIKEY"
    },
    "blurs": {
        "mod": ["what's the mod called?", "change into what?"],
        "talk": ["say something", "say what?", "type something"],
        "resource": ["what's the name?", "name this resource", "what's it called?"],
        "chain": ["enter name of chained trigger", "what happens next?", "next trigger"],
        "vibe": ["name that vibe", "what's the vibe?", "enter the name of your vibe"],
        "iframe": ["please type in the url", "what's the web address?", "enter website"],
        "lat": ["what's the latitude?", "enter latitude", "latitude please"],
        "lng": ["what's the longitude?", "enter longitude", "longitude please"],
        "environment": ["what's the environment?", "which environment?", "environment"],
        "gesture": ["what's the gesture?", "gesture, please", "any gesture?"],
        "dance": ["got a dance in mind?", "how about a dance?", "would you like to dance?"],
        "name": ["what's the name?", "name, please", "name?"],
        "trigger": ["what's the trigger?", "trigger?"],
        "className": ["string of CSS class names", "enter class names here"],
        "css": ["enter custom CSS rules", "custom CSS here", "style with CSS"]
    },
    "loaders": {
        "customs": ["one.earring", "one.pony"],
        "templates": ["one.appliance", "one.body", "one.vstrip", "one.vswarm", "one.audio", "one.fbx"],
        "environments": [
            "one.box",
            "one.day",
            "one.night",
            "one.peak",
            "one.cave",
            "one.hill",
            "one.tombs",
            "one.forest",
            "one.beneath",
            "one.basement",
            "one.apartment",
            "one.techno",
            "one.walls",
            "one.gates",
            "one.patmos",
            "one.library",
            "one.scrolly",
            "one.kidroom"
        ],
        "avatars": ["one.body.sassy", "one.body.kid"],
        "tlchans": ["surf"]
    },
    "volumes": {
        "fx": 0.8,
        "music": 0.2,
        "ambient": 0.5
    },
    "builders": {
        "games": {
            "demos": []
        },
        "talk": {
            "identities": [],
            "help": {
                "mod": "Mods are configured on the mod page. Use 'unmod' to stop modding.",
                "responses": "Your character will say one of these in response to this trigger.",
                "disable": "Disable any triggers that should no longer apply at this point in the conversation. Use 'untrigger' to clear all.",
                "chain": "Chain together triggers to define complex responses.",
                "vibe": "Vibes are configured on the vibe page.",
                "mood": "Fine-tune your character's emotional response to this trigger.",
                "media": "Various immersive effects.",
                "gesture": "Gestures are configured on the gesture page. Use 'ungesture' to stop gesturing.",
                "dance": "Dances are configured on the gesture page. Use 'undance' to stop dancing.",
                "triggers": "These are the trigger words for the current branch. Use '*' for your fallback response."
            }
        },
        "tweak": {
            "staticSpring": {
                "k": 200,
                "damp": 100
            }
        },
        "furniture": {
            "pool": {
                "name": "pool",
                "thing": "Pool",
                "scale": [1.2, 1.2, 2],
                "position": [0, -35, 0],
                "rotation": [-1.57, 0, 0]
            }
        },
        "room": {
            "environment": "one.scrolly",
            "objects": []
        },
        "accessories": {
            "sassy": ["earring"],
            "kid": ["hat"]
        },
        "person": {
            "mood": {},
            "colors": {},
            "responses": {},
            "voice": "Joanna",
            "body": {
                "template": "templates.one.body.basic"
            }
        }
    }
}