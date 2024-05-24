import at from "./aliasTiles.js";

/**
 * A list of tabs with their own categories.
 * Here are some common first tile character meanings:
 * 
 * `*`: Related to tiles or circles
 * `M`: Metal balls
 * `B`: Buttons
 * `b`: Bubbles
 * `D`: Drains
 * `d`: Donuts
 * `J`: Jawbreakers
 * `W`: Watermelons
 * `G`: Globes
 * `P`: Paint related
 * `C`: Cannons
 * `c`: Camera related
 */
const tabTiles = {
    circles: {
        name: "Circles & Tiles",
        tiles: {
            name: "Tiles",
            tiles: ["--","-O","*S","*s","cp"]
        },
        removing: {
            name: "Removing",
            tiles: ["-C","-c","-W"]
        },
        circles: {
            name: "Regular and Black Circles",
            tiles: ["**","*0","*1","*2","*3","*4","*5","*B"]
        },
        specials: {
            name: "Special Circles",
            tiles: ["*-","*|","*O","*/","*+"]
        }

    },
    blockers: {
        name: "Blockers",
        metalBalls: {
            name: "Metal Balls",
            tiles: ["M1", "M2", "M3", "M4", "M5", "M6"]
        },
        drains: {
            name: "Drains",
            tiles: ["D1", "D2"]
        },
        bubbles: {
            name: "Bubbles",
            tiles: ["b1", "b2", "b3"]
        },
        watermelons: {
            name: "Watermelons",
            tiles: ["W1", "W2", "W3"]
        },
        donuts: {
            name: "Donuts",
            tiles: ["d1", "d2", "d3"]
        },
        jawbreakers: {
            name: "Jawbreakers",
            tiles: ["J1", "J2", "J3", "J4"]
        },
        ice: {
            name: "Ice",
            tiles: ["I0"]
        },
    },
    walls: {
        name: "Walls",
        candyBeads: {
            name: "Candy Beads",
            tiles: ["E^","Ev","E<","E>"]
        }
    },
    misc: {
        name: "Miscellanous",
        globes: {
            name: "Globes & their Exit",
            "tiles": ["G1", "G2", "G-"]
        },
        buttons: {
            name: "Buttons",
            tiles: ["B1", "B2", "B3"]
        },
        paint: {
            name: "Paint",
            tiles: ["PT"]
        },
        customSpawns: {
            name: "Custom Spawn Points",
            tiles: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9"]
        }
    },
    all: {
        name: "All Tiles",
        tiles: {
            name: "",
            tiles: at.flat()
        }
    },
    cannons: {
        name: "Cannons",
        normal: {
            name: "Normal Cannons",
            tiles: ["CG"]
        },
        layered: {
            name: "Layered Cannons",
            tiles: ["CW", "CJ", "Cd"]
        },
        circle: {
            name: "Circle Cannons",
            tiles: ["C-", "C|", "CO", "C+"]
        }
    }
}

export default tabTiles;