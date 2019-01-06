# ctvu
Connective tissue and basic interfaces for virtual world builders and applications.


# Back (Init Config)

    syms = {
    	"js": ["vu"],
    	"css": ["vu.css"],
    	"html": ["vu"]
    }
    requires = ["virtyou/ctzero"]

# Front (JS Config)

## core.config.ctvu
### Import line: 'CT.require("core.config");'
    {
        "storage": {
            "mode": "local",
            "apikey": "APIKEY"
        },
        "customs": [],
        "templates": [],
        "builders": {
            "furniture": {},
            "room": {},
            "accessories": {},
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
                "body": {}
            }
        }
    }