const levelThings = {
    /**
     * All possible goal types of a level.
     */
    goals:
    `Score,Button,Globe,Paint,Ice,
    Red Circle,Orange Circle,Yellow Circle,Green Circle,Blue Circle,Purple Circle,Black Circle,
    Striped Circle,Radial Circle,Rainbow Circle,
    Metal Ball (L),Watermelon (L),Donut (L),Jawbreaker,Candy Beads`.split(","),

    noGoalNumber:
    `score`.split(","),

    optionalGoalNumber:
    `button,paint,ice`.split(","),

    /**
     * Goals that are NOT requirements and cannot be used as a requirement.
     */
    notReqs:
    `Score,Rainbow Circle,Striped Circle,Horizontal Circle,Candy Beads`.split(","),

    /**
     * All possible types of a cannon of a level.
     */
    cannonTypes:
    `Watermelon,Globe,Vertical Striped Circle,Horizontal Striped Circle,Radial Circle,Extra Time Circle,Donut,Jawbreaker,Key,Rainbow Circle`.split(","),

    /**
     * All layered cannon types (in snake case).
     */
    layeredCannons:
    `watermelon,jawbreaker,donut`.split(","),

    /**
     * All layered goals (in snake case).
     */
    layeredGoals:
    `metal_ball,donut,watermelon`.split(","),

    /**
     * All types of hardness.
     */
    hardTypes:
    `Normal,Hard,Super Hard,Extremely Hard,Mythically Hard`.split(",").map(o => o + " Level"),

    /**
     * Returns an array of all custom spawn points from S1, S2 ... S9.
     */
    customSpawns:
    Array.from({length: 9}, ((v, k) => k + 1)) // Create an array like: [1, 2, 3 ... 9]
                .map((o) => "S" + o),                  // Add S to each of them.

    /**
     * Tells all level tabs.
    */
    levelTabs:
    `Properties,Goals,Cannons,Teleporters,Camera,Spawning,Miscellanous,Gravitation`.split(","),

    /**
     * Tells all colors.
     */
    colors:
    `Red,Yellow,Blue,Green,Orange,Purple,Black`.split(","),

    /**
     * Tells all tiles which rotate with gravitation.
     */
    rotatesWithGravitation:
    `G-,*S,?1,?2`.split(",").concat(Array.from({length: 9}, ((v, k) => k + 1)).map((o) => "S" + o)),

    /**
     * Contains all tile markers.
     */
    tileMarkers:
    `G-,*S`.split(",").concat(Array.from({length: 9}, ((v, k) => k + 1)).map((o) => "S" + o)),

    /**
     * Contains all circle types that can have a fixed color.
     */
    fixable:
    ["*O","*-","*|","*+","**","*K"],

    /**
     * Contains all specials that can have a fixed color.
     */
    fixableSpecials:
    ["*O","*-","*|","*+","*K"],

    /**
     * Contains all color tiles.
     */
    colorTiles:
    `*0,*1,*2,*3,*4,*5,*B`.split(","),

    /**
     * Tells if a tile is a wall (example: beads)
     */
    isWall (tile) {
        return tile[0] === "E";
    },

    /**
     * Tells if a tile is a metal ball.
     */
    isMetalBall (tile) {
        return tile[0] === "M";
    },

    /**
     * Tells if a tile is ice.
     */
    isIce (tile) {
        return tile === "I0";
    },

    /**
     * Tells if a tile is a watermelon.
     */
    isWatermelon (tile) {
        return tile[0] === "W";
    },

    /**
     * Tells if a tile is a key. Works for compound tiles too!
     */
    isKey (tile) {
        if (tile.length === 2) return tile == "*K";
        return tile.match(/[\s\S]{1,2}/g).includes("*K");
    },

    /**
     * Tells if a tile is a circle chest.
     */
    isCircleChest (tile) {
        return tile != "cp" && tile[0] == "c"
    },

    /**
     * Tells if a tile is a plastic capsule.
     */
    isPlasticCapsule (tile) {
        return tile[0] == "p";
    },

    /**
     * Tells if a tile is an encasing blocker (excluding capsules).
     */
    encases (tile) {
        return tile[0] == "D" || tile[0] == "b" || (tile[0] == "c" && !isNaN(parseInt(tile[1])));
    },

    /**
     * Get the displayed offset of a tile, via an array with two numbers.
     */
    getOffsetOf (tile) {
        if (this.isWall(tile)) {
            switch (tile[1]) {
                case "<":
                    return [-11, 0];
                case ">":
                    return [11, 0];
                case "v":
                    return [0, 11];
                case "^":
                    return [0, -11];
                default: return [0, 0];
            }
        }
        return [0, 0];
    }
}

export default levelThings;