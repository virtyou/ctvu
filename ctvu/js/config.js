{
    "access" : {
        "anon": true
    },
    "storage": {
        "mode": "local",
        "apikey": "APIKEY"
    },
    "blurs": {
        "talk": ["say something", "test voice", "type something"],
        "resource": ["what's the name?", "name this resource", "what's it called?"],
        "chain": ["enter name of chained trigger", "what happens next?", "next trigger"]
    },
    "loaders": {
        "customs": ["one.earring", "one.pony"],
        "templates": ["one.torso"],
        "environments": ["one.techno", "one.scrolly", "one.kidroom"],
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
            "voice": "Joanna",
            "body": {
                "template": "templates.one.torso.sassy"
            }
        }
    }
}