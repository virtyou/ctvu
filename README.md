# ctvu
Connective tissue and basic interfaces for virtual world builders and applications.


# Back (Init Config)

    syms = {
    	"js": ["vu"],
    	"css": ["vu.css"],
    	"html": ["vu"]
    }
    requires = ["virtyou/ctone"]

# Front (JS Config)

## core.config.ctvu
### Import line: 'CT.require("core.config");'
    {
        "storage": {
            "mode": "local",
            "apikey": "APIKEY"
        },
        "loaders": {
            "customs": ["one.earring", "one.pony"],
            "templates": ["one.torso"]
        },
        "builders": {
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
                "environment": "one.techno",
                "objects": []
            },
            "accessories": {
                "sassy": ["earring"],
                "kid": ["hat"]
            },
            "person": {
                "mood": {},
                "colors": {},
                "responses": {
                    "*": {
                        "phrase": ["um what?", "i wasn't listening", "this is my default response"],
                        "mood": {}
                    }
                },
                "moody": false,
                "voice": "Joanna",
                "body": {
                    "template": "templates.one.torso.sassy"
                }
            }
        }
    }