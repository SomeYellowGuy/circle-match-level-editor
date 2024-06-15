import { useRef, useEffect, useState } from "react";
import at from "./aliasTiles.js";
import conflictingTiles from "./conflicts.js";
import tilesSource from "./tiles.png";
import levelThings from "./levelThings.js";

function Board(props) {
    const boardRef = useRef(null)
    const canvas = boardRef.current;

    /** The tile size of a tile in the board canvas. */
    const TILE_SIZE = 80.5;

    const MAX_C_WIDTH = 1360;
    const MAX_C_HEIGHT = 723;

    let t = [];
    for (let i = 0; i < 9; i++) {
        let l = [];
        for (let j = 0; j < 12; j++) l.push(["--"]);
        t.push(l)
    }
    const [tiles, setTiles] = useState(t);
    const [src, setSRC] = useState(null);

    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        // Clean up the event listener when the component unmounts.
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    function changeTeleAttribute(n, attrib, to, c) {
        let g = [...props.teles];
        if (!g[n]) return;
        let prop = attrib.slice(0,-1);
        let t = g[n][prop];
        t[Number(attrib[attrib.length-1])] = Number(to);
        g[n][prop] = t;
        props.steles(g);
    }

    function isStraight(p1, p2) {
        if (!p1 || !p2) return true;
        return p1[0] == p2[0] || p1[1] == p2[1]
    }

    function changePointOfPath(path, point, newPosition) {
        let d = structuredClone(props.gd);
        let o = d.paths;
        if (o.length <= path || o[path].length <= point-1 || point < 1 || o.length < 1) return;
        // Check if the new position is strictly vertically or horizontally distant.
        if (point > 0 && !isStraight(o[path][point-2], newPosition)) return;
        o[path][point-1] = newPosition;
        props.setgd({ custom: d.custom, paths: o });
        props.setscpp(props.scpp + 1);
    }

    function addPointToPath(path, position) {
        let d = structuredClone(props.gd);
        let o = d.paths;
        if (o.length <= path) return;
        const len = o[path].length;
        // Check if the new position is strictly vertically or horizontally distant.
        if (len >= 1 && !isStraight(position, o[path][len-1])) return;
        o[path].push(position);
        props.setgd({ custom: d.custom, paths: o });
        props.setscpp(props.scpp + 1);
    }

    function handleClick(e) {
        const ctx = canvas?.getContext("2d");
        if (!ctx) return;
        // Set the tile.
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        const tileSize = TILE_SIZE;
        let tileX = Math.floor(x / tileSize);
        let tileY = Math.floor(y / tileSize);
        let oldTiles = tiles;
        if (tileX < props.m.width && tileY < props.m.height && tileX >= 0 && tileY >= 0) {
            if (props.ts && props.ts[0] === tileX && props.ts[1] === tileY) props.sts(null);
            else props.sts([tileX, tileY])

            // For selecting teleporter positions.
            if (props.sct > 0 && props.mct === "teleporters") {
                // Place a teleporter somewhere.
                switch (e.button) {
                    case 0:
                        // Left click
                        changeTeleAttribute(props.sct - 1, "from0", tileX + 1);
                        changeTeleAttribute(props.sct - 1, "from1", tileY + 1);
                        break;
                    case 2:
                        // Right click
                        changeTeleAttribute(props.sct - 1, "to0", tileX + 1);
                        changeTeleAttribute(props.sct - 1, "to1", tileY + 1);
                        break;
                }
            } else if (props.scp > 0 && props.mct === "gravitation" && props.gd.custom) {
                switch (e.button) {
                    case 0:
                        // Left click (add a new point)
                        addPointToPath(props.scp - 1, [tileX, tileY]);
                    case 2:
                        // Right click (change a point's position)
                        changePointOfPath(props.scp - 1, props.scpp, [tileX, tileY])
                }
            } else if (props.s) {
                // For a normal tile.
                switch (e.button) {
                    case 0:
                        const cannonTiles = oldTiles[tileY][tileX].filter(t => t && t[0] === "C");
                        const others = oldTiles[tileY][tileX].filter(t => t && t[0] !== "C");
                        // Left button
                        let u = false; // Should add cannon tiles?
                        let uOverride = false;
                        if (props.s === "*s") return;
                        if (props.s === "--") {
                            // Delete any camera on that tile.
                            let i = 0;
                            for (const camera of props.cd.cameras) {
                                if (camera[0] === tileX && camera[1] === tileY) {
                                    // Delete the camera.
                                    let newCameras = structuredClone(props.cd);
                                    newCameras.cameras.splice(i, 1);
                                    props.setcd(newCameras);
                                }
                                i++;
                            }
                            oldTiles[tileY][tileX] = [];
                            u = true;
                        } else if (props.s === "-O") {
                            oldTiles[tileY][tileX] = ["-O"];
                            u = true;
                        } else if (props.s === "-C") {
                            // Delete all cannon tiles.
                            uOverride = true;
                        } else if (props.s === "cp") {
                            // Add a camera in the data.
                            let cameraData = props.cd;
                            // If a camera at the same position already exists, don't add it.
                            let exists = false;
                            for (const camera of cameraData.cameras) {
                                if (camera.x === tileX && camera.y === tileY) {
                                    exists = true;
                                    break;
                                }
                            }
                            if (!exists) cameraData.cameras.push([tileX, tileY])
                        } else if (props.s === "-c") {
                            // Delete any camera on that tile.
                            let i = 0;
                            for (const camera of props.cd.cameras) {
                                if (camera[0] === tileX && camera[1] === tileY) {
                                    // Delete the camera.
                                    let newCameras = structuredClone(props.cd);
                                    newCameras.cameras.splice(i, 1);
                                    props.setcd(newCameras);
                                }
                                i++;
                            }
                        } else if (props.s === "-W") {
                            // Delete any wall on that tile.
                            for (let i = 0; i <= oldTiles[tileY][tileX].length; i++) {
                                const tile = oldTiles[tileY][tileX][i];
                                if (tile && levelThings.isWall(tile)) {
                                    oldTiles[tileY][tileX].splice(i);
                                }
                            }
                        } else if (!(oldTiles[tileY]?.[tileX].includes(props.s))) {
                            if (oldTiles[tileY]?.[tileX]) for (let i = 0; i < oldTiles[tileY][tileX].length; i++) {
                                let tile = oldTiles[tileY][tileX][i];
                                for (let g = 0; g < conflictingTiles.length; g++) {
                                    let c = conflictingTiles[g]
                                    if (c.includes(tile) && c.includes(props.s)) oldTiles[tileY][tileX].splice(i, 1);
                                }
                            }
                            if (props.s && oldTiles[tileY]?.[tileX].some(o => o === "-O")) {
                                oldTiles[tileY][tileX] = [];
                                u = true;
                            }
                            if (oldTiles[tileY]?.[tileX] && !oldTiles[tileY]?.[tileX].some(o => o === props.s)) {
                                oldTiles[tileY][tileX].push(props.s)
                            }
                        }

                        if (uOverride && cannonTiles.length > 0) {
                            for (let i = 0; i <= oldTiles[tileY][tileX].length; i++) {
                                const tile = oldTiles[tileY][tileX][i];
                                if (tile[0] === "C") {
                                    oldTiles[tileY][tileX].splice(i);
                                }
                            }
                        } else if (u && others.length > 0) oldTiles[tileY][tileX] = oldTiles[tileY][tileX].concat(cannonTiles);

                        break;
                    case 2:
                        // Right button
                        oldTiles[tileY][tileX] = [];
                        break;
                }
                // Sort the tiles.
                let bTiles = []; // Buttons
                let pTiles = []; // Paint
                let mTiles = []; // Anything else (usually normal tiles like circles)
                let cTiles = []; // Capsules
                let eTiles = []; // Encasing blockers
                let tTiles = []; // Tile markers
                // Order (shown above the rest ------> shown behind the rest)
                // Tile markers - Encasing blockers - Normal tiles - Buttons - Paint
                if (oldTiles[tileY][tileX].length) for (let i = 0; i < oldTiles[tileY][tileX].length || 0; i++) {
                    let tile = oldTiles[tileY][tileX][i];
                    if (tile[0] === "B") bTiles.push(tile);
                    else if (tile === "PT") pTiles.push(tile);
                    else if (levelThings.isPlasticCapsule(tile)) cTiles.push(tile);
                    else if (levelThings.encases(tile)) eTiles.push(tile);
                    else if (levelThings.tileMarkers.includes(tile)) tTiles.push(tile);
                    else mTiles.push(tile);
                }
                oldTiles[tileY][tileX] = pTiles.concat(bTiles, mTiles, cTiles, eTiles, tTiles)
                setTiles(oldTiles)
                props.st(oldTiles);
            }
        }
        //
        updateTiles(oldTiles)
    }

    useEffect(() => {
        setTiles(props.t)
        updateTiles(props.t);
    }, [props.t, screenSize])

    function updateTiles(tiles) {
        let image = new Image();
        image.src = tilesSource;
        setSRC(image);

        const MAX_WIDTH = props.m.width;
        const MAX_HEIGHT = props.m.height;

        const ctx = canvas?.getContext("2d");
        if (!ctx) return;

        const tileSize = TILE_SIZE;
        const w = Math.max(tileSize * MAX_WIDTH, MAX_C_WIDTH);
        const h = Math.max(tileSize * MAX_HEIGHT, MAX_C_HEIGHT);
        canvas.width = w;
        canvas.height = h;

        if (!props.l) {
            ctx.fillStyle = "#eeeeee";
            ctx.fillRect(0, 0, w, h);
            return;
        }
        ctx.fillStyle = "#adceff";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#5599ff";
        ctx.fillRect(0, 0, tileSize * MAX_WIDTH, tileSize * MAX_HEIGHT);
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 1.0;
        for (let y = 1; y < MAX_HEIGHT + 1; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * tileSize);
            ctx.lineTo(tileSize * MAX_WIDTH, y * tileSize);
            ctx.stroke();
        }
        for (let x = 1; x < MAX_WIDTH + 1; x++) {
            ctx.beginPath();
            ctx.moveTo(x * tileSize, 0)
            ctx.lineTo(x * tileSize, tileSize * MAX_HEIGHT);
            ctx.stroke();
        }
        ctx.fillStyle = "rgba(0,0,0,0)"
        // Draw tiles.

        function getDimensions(code) {
            const flatat = at.flat();
            let index = flatat.indexOf(code);
            if (index === -1) index = 8;
            let x = index % 8;
            let y = Math.floor(index / 8);
            return { x: x * 64, y: y * 64, w: 64, h: 64, i: index }
        }

        // Get the first camera viewing area.
        const firstCamera = props?.cd?.cameras[0];

        for (let y = 0; y < MAX_HEIGHT; y++)
            for (let x = 0; x < MAX_WIDTH; x++) {
                ctx.fillStyle = "rgba(0,0,0,0.65)";
                const unrelated = []; // Technically not tiles.

                let filled = false;
                for (const t of tiles[y]?.[x]) {
                    if (!unrelated.includes(t)) filled = true;
                }
                if (filled) ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

                ctx.fillStyle = "rgba(190,190,190,0.1)";
                if (
                    firstCamera &&
                    Math.abs(firstCamera[0] - x) <= (props.cd.width - 1) / 2 &&
                    Math.abs(firstCamera[1] - y) <= (props.cd.height - 1) / 2
                   )
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }

        for (let y = 0; y < MAX_HEIGHT; y++) {
            for (let x = 0; x < MAX_WIDTH; x++) {
                if (tiles?.[y]?.[x]) {

                    for (let i = 0; i < tiles[y][x].length; i++) {
                        let tile = tiles[y][x][i];
                        let k = tile;
                        if (tiles[y][x].some(o => levelThings.colorTiles.includes(o))) {
                            // +Special?
                            if (tiles[y][x].some(o => levelThings.fixableSpecials.includes(o))) {
                                if (tile[0] === "*" && !["*/", "*S"].concat(levelThings.customSpawns).includes(tile)) {
                                    k = tiles[y][x].filter(o => levelThings.colorTiles.includes(o))[0] +
                                        tiles[y][x].filter(o => levelThings.fixableSpecials.includes(o))[0]
                                }
                            }
                        }
                        if (k[0] == "S") k = "*S";
                        const d = getDimensions(k);
                        const other_90_percents = ["G-", "*S", "PT", "I0", "B1", "B2", "B3", "J1", "J2", "J3", "J4"];
                        const is_90_percent = conflictingTiles[1].includes(tile) || other_90_percents.includes(tile) || tile[0] == "S" || levelThings.isKey(k) || levelThings.isCircleChest(tile);
                        const is_85_percent = tile[0] === "d";
                        let ds = (1 - (levelThings.isPlasticCapsule(tile) ? 0.95 : (is_90_percent ? 0.9 : (is_85_percent ? 0.85 : 0.75)))) * tileSize;
                        if (tile[0] == "S") {
                            // Add a number to be displayed.
                            ctx.fillStyle = "rgba(255,255,255,0.7)";
                            ctx.strokeStyle = "rgba(255,255,255,0.9)";
                            ctx.font = "20px Segoe UI";
                            ctx.textAlign = "center";
                            fillText(ctx, tile[1], (x + 0.15) * tileSize + ds / 2, (y + 0.15) * tileSize + ds / 2, tile, x, y);
                            ctx.font = "23px Segoe UI";
                            strokeText(ctx, tile[1], (x + 0.15) * tileSize + ds / 2, (y + 0.15) * tileSize + ds / 2, tile, x, y);
                        }
                        const s = tileSize;
                        if (tile === "G2") ds = 0.1 * tileSize;
                        if (levelThings.isMetalBall(tile)) ds = 0.15 * tileSize;
                        if (levelThings.isWatermelon(tile)) ds = 0.225 * tileSize;
                        if (levelThings.isWall(tile)) ds = -0.05;
                        const offset = levelThings.getOffsetOf(tile);

                        if (tile !== "--" && tile !== "-O" && tile[0] !== "C")
                        drawImage(ctx, src, d.x, d.y, d.w, d.h, x * tileSize + ds / 2 + offset[0], y * tileSize + ds / 2 + offset[1], s - ds, s - ds, x, y, tile)
                        let c = 0;
                        ctx.fillStyle = "rgba(0,0,0,0.1)";
                        if (tiles[y][x].some(o => o[0] === "C")) ctx.fillRect(x * tileSize, y * tileSize, tileSize, 0.3 * tileSize);
                        for (let cannon of tiles[y][x].filter(o => o[0] === "C").reverse()) {
                            const d = getDimensions("??" + cannon)
                            const ds = 0.75 * tileSize;
                            const l = tiles[y][x].filter(o => o[0] === "C").length + 1
                            drawImage(ctx, src, d.x, d.y, d.w, d.h,
                                (x + 0.4) * tileSize + ds / 2 - (c * tileSize / l) - 5,
                                (y - 0.35) * tileSize + ds / 2 + offset[1],
                            s - ds, s - ds, x, y, tile);
                            c++;
                        }
                        ctx.fillStyle = "rgba(255,255,255,0.15)";
                        if (props.ts && props.ts[0] === x && props.ts[1] === y) ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    }
                }
                let t;
                const s = tileSize;
                const rotation = dirOfPosition([x, y]);
                const validEntryTeleporters = props.teles.filter(o => o.from[0] === x + 1 && o.from[1] === y + 1);
                if (validEntryTeleporters.length > 0) {
                    let first = validEntryTeleporters[0];
                    let num = props.teles.map((t, ind) => t.from[0]===first.from[0]&&t.from[1]===first.from[1]&&t.to[0]===first.to[0]&&t.to[1]===first.to[1] ? ind : null);
                    // Teleporter Entry
                    t = getDimensions("?1");
                    let ds = 0.1 * tileSize;
                    drawImage(ctx, src, t.x, t.y, t.w, t.h, x * tileSize + ds / 2, y * tileSize + ds / 2, s - ds, s - ds, x, y, "?1");

                    ctx.fillStyle = "rgba(0,0,0,0.7)";
                    ctx.font = "15px Segoe UI";
                    ctx.textAlign = "center";
                    ctx.strokeStyle = "rgba(4,4,4,0.5)";
                    fillText(ctx, num.filter(n => n != null)[0] + 1 , (x + 0.45) * tileSize + ds / 2, (y + 0.9) * tileSize + ds / 2, "?1", x, y, true);
                    strokeText(ctx, num.filter(n => n != null)[0] + 1 , (x + 0.45) * tileSize + ds / 2, (y + 0.9) * tileSize + ds / 2, "?1", x, y, true);
                }
                const validExitTeleporters = props.teles.filter(o => o.to[0] === x + 1 && o.to[1] === y + 1);
                if (validExitTeleporters.length > 0) {
                    let first = validExitTeleporters[0];
                    let num = props.teles.map((t, ind) => t.from[0]===first.from[0]&&t.from[1]===first.from[1]&&t.to[0]===first.to[0]&&t.to[1]===first.to[1] ? ind : null);
                    // Teleporter Exit
                    t = getDimensions("?2");
                    let ds = 0.1 * tileSize;
                    drawImage(ctx, src, t.x, t.y, t.w, t.h, x * tileSize + ds / 2, y * tileSize + ds / 2, s - ds, s - ds, x, y, "?2")

                    ctx.fillStyle = "rgba(0,0,0,0.7)";
                    ctx.font = "15px Segoe UI";
                    ctx.textAlign = "center";
                    ctx.strokeStyle = "rgba(4,4,4,0.5)";
                    fillText(ctx, num.filter(n => n != null)[0] + 1, (x + 0.45) * tileSize + ds / 2, (y + 0.1) * tileSize + ds / 2, "?2", x, y, true);
                    strokeText(ctx, num.filter(n => n != null)[0] + 1, (x + 0.45) * tileSize + ds / 2, (y + 0.1) * tileSize + ds / 2, "?2", x, y, true);
                }
                const validCameras = props.cd.cameras.filter(o => o[0] === x && o[1] === y);
                if (validCameras.length > 0) {
                    let first = validCameras[0];
                    let num = props.cd.cameras.map((t, ind) => t[0] === first[0] && t[1] === first[1] ? ind : null);
                    // Camera
                    t = getDimensions("cp");
                    let ds = 0.1 * tileSize;
                    drawImage(ctx, src, t.x, t.y, t.w, t.h, x * tileSize + ds / 2, y * tileSize + ds / 2, s - ds, s - ds, x, y, "cp")

                    ctx.fillStyle = "rgba(0,0,0,0.5)";
                    ctx.font = "23px Segoe UI";
                    ctx.textAlign = "center";
                    fillText(ctx, num.filter(n => n != null)[0] + 1, (x + 0.32) * tileSize + ds / 2, (y + 0.55) * tileSize + ds / 2, "cp");
                }
            }
        }

        if (props.gd.custom) {
            let pathN = -1;
            const transparencyMultiplier = props.mct === "gravitation" ? 1.0 : 0.3;
            for (const path of props.gd.paths) {
                let i = 0;
                pathN++;
                if (path.length === 0) continue;
                // Each path has multiple points.
                ctx.lineWidth = 15;
                ctx.lineCap = "round";
                const hue = pathN * 18;
                for (const point of path.slice(1)) {
                    ctx.beginPath();
                    let last = path[i];
                    ctx.moveTo((last[0]+0.5) * tileSize, (last[1]+0.5) * tileSize);
                    let gradient = ctx.createLinearGradient((last[0]+0.5) * tileSize, (last[1]+0.5) * tileSize, (point[0]+0.5) * tileSize, (point[1]+0.5) * tileSize);
                    gradient.addColorStop(0, "hsla("+hue+"deg, 70%, 100%, "+(40*transparencyMultiplier)+"%)");
                    gradient.addColorStop(1, "hsla("+hue+"deg, 70%, 3%, "+(40*transparencyMultiplier)+"%)");
                    ctx.strokeStyle = gradient;
                    i++;
                    ctx.lineTo((point[0]+0.5) * tileSize, (point[1]+0.5) * tileSize);
                    ctx.stroke();
                }
            }
            const offset = [0, 7]
            for (const path of props.gd.paths) {
                let i = 0;
                for (const point of path) {
                    ctx.fillStyle = "rgba(10,10,10,"+(80*transparencyMultiplier)+"%)";
                    ctx.strokeStyle = "rgba(255,255,255,"+(80*transparencyMultiplier)+"%)";
                    ctx.lineWidth = 6;
                    ctx.font = "24px Segoe UI";
                    ctx.textAlign = "center";
                    strokeText(ctx, i+1, (point[0]+0.5) * tileSize + offset[0], (point[1]+0.5) * tileSize + offset[1]);
                    fillText(ctx, i+1, (point[0]+0.5) * tileSize + offset[0], (point[1]+0.5) * tileSize + offset[1]);
                    i++;
                }
            }
        }
    }

    function isBetween(middle, from, to) {
        // If the points are not on a straight line, it is not between.
        if (!isStraight(from, middle) || !isStraight(middle, to)) return false;
        // If the middle is exactly at from or to, return true.
        if (from[0] === middle[0] && from[1] === middle[1]) return true;
        if (to[0] === middle[0] && to[1] === middle[1]) return true;
        // Between cases!
        if (from[0] > middle[0] && middle[0] > to[0]) return true;
        if (from[0] < middle[0] && middle[0] < to[0]) return true;
        if (from[1] > middle[1] && middle[1] > to[1]) return true;
        if (from[1] < middle[1] && middle[1] < to[1]) return true;
        // ...
        return false;
    }

    function dirOfPosition(pos, degrees) {
        if (props.gd.paths.length == 0 || !props.gd.custom) return 0;
        for (const path of props.gd.paths) {
            let i = 0;
            for (const point of path.slice(1)) {
                const last = path[i++];
                if (!isBetween(pos, last, point)) continue;
                const delta = [point[0] - last[0], point[1] - last[1]];
                if (delta[0] > 0) {
                    // Right!
                    return !degrees ? -Math.PI/2 : -90;
                } else if (delta[0] < 0) {
                    // Left!
                    return !degrees ? Math.PI/2 : 90;
                } else if (delta[1] > 0) {
                    // Down!
                    return 0;
                } else if (delta[1] < 0) {
                    // Up!
                    return !degrees ? Math.PI : 180;
                }
            }
        }
        return 0;
    }

    function drawImage(ctx, src, x, y, w, h, a, b, c, d, tileX, tileY, tile) {
        const dir = dirOfPosition([tileX, tileY]);
        if (levelThings.rotatesWithGravitation.includes(tile) && props.gd.paths.length > 0 && dir !== 0) {
            // Rotate the drawn image based on gravity.
            ctx.translate(a + c/2, b + d/2);
            ctx.rotate(dir)
            ctx.drawImage(src, x, y, w, h, -c/2, -d/2, c, d);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
            ctx.drawImage(src, x, y, w, h, a, b, c, d)
        }
    }

    function fillText(ctx, text, x, y, tile, tileX, tileY) {
        const dir = levelThings.rotatesWithGravitation.includes(tile) ? dirOfPosition([tileX, tileY], true) : 0;
        if (dir === 0) {
            ctx.textBaseline = "alphabetic";
            ctx.fillText(text, x, y);
        } else {
            ctx.textBaseline = "middle";
            const center = [(tileX + 0.5) * TILE_SIZE, (tileY + 0.5) * TILE_SIZE];
            const offset = [x - center[0], y - center[1]];
            let newOffset;
            switch (dir) {
                case 90:
                    newOffset = [-offset[1], -offset[0]];
                    break;
                case 180:
                    newOffset = [-offset[0], -offset[1]];
                    break;
                case -90:
                    newOffset = [offset[1], offset[0]];
                    break;
                case 0:
                default:
                    newOffset = offset;
                    break;
            }
            ctx.fillText(text, center[0] + newOffset[0] - 4, center[1] + newOffset[1]);
        }
    }

    function strokeText(ctx, text, x, y, tile, tileX, tileY, leftOffset) {
        const dir = levelThings.rotatesWithGravitation.includes(tile) ? dirOfPosition([tileX, tileY], true) : 0;
        if (dir === 0) {
            ctx.textBaseline = "alphabetic";
            ctx.strokeText(text, x, y);
        } else {
            ctx.textBaseline = "middle";
            const center = [(tileX + 0.5) * TILE_SIZE, (tileY + 0.5) * TILE_SIZE];
            const offset = [x - center[0], y - center[1]];
            let newOffset;
            switch (dir) {
                case 90:
                    newOffset = [-offset[1], -offset[0]];
                    break;
                case 180:
                    newOffset = [-offset[0], -offset[1]];
                    break;
                case -90:
                    newOffset = [offset[1], offset[0]];
                    break;
                case 0:
                default:
                    newOffset = offset;
                    break;
            }
            ctx.strokeText(text, center[0] + newOffset[0] - (leftOffset ? 4 : 0), center[1] + newOffset[1]);
        }
    }

    useEffect(() => {
        updateTiles(props.t);
    }, [props.m, props.l, props.t, props.ts, props.teles, props.cd, props.gd, props.mct]);

    return (
        <canvas
            className="Board"
            onContextMenu={e => e.preventDefault()}
            onMouseDown={handleClick}
            onResize={() => updateTiles(tiles)}
            ref={boardRef}
        />
    );
}

export default Board;