# ctvu
Connective tissue and basic interfaces for virtual world builders and applications.


# Back (Init Config)

    syms = {
    	"js": ["vu"],
    	"css": ["vu.css"],
    	"html": ["vu"]
    }
    model = {
    	"ctvu.model": ["*"]
    }
    requires = ["virtyou/ctone"]

# Front (JS Config)

## core.config.ctvu
### Import line: 'CT.require("core.config");'
    {
        "access" : {
            "anon": true
        },
        "storage": {
            "mode": "local",
            "apikey": "APIKEY"
        },
        "blurs": {
            "talk": ["say something", "test voice", "type something"]
        },
        "loaders": {
            "customs": ["one.earring", "one.pony"],
            "templates": ["one.torso"],
            "environments": ["one.techno", "one.kidroom"],
            "avatars": ["one.torso.sassy", "one.torso.kid"]
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