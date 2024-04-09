import { useRef, useEffect, useState } from "react";
import at from "./aliasTiles.js";
import conflictingTiles from "./conflicts.js";
import tilesSource from "./tiles.png";

function Board(props) {
    const boardRef = useRef(null)
    const canvas = boardRef.current;
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

    function handleClick(e) {
        const MAX_WIDTH = props.m.width;
        const MAX_HEIGHT = props.m.height;
        const ctx = canvas?.getContext("2d");
        if (!ctx) return;
        // Set the tile.
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        const tileSize = w / MAX_WIDTH * MAX_HEIGHT > h ? h / MAX_HEIGHT : w / MAX_WIDTH;
        let tileX = Math.floor(x / tileSize);
        let tileY = Math.floor(y / tileSize);
        let oldTiles = tiles;
        if (tileX < props.m.width && tileY < props.m.height) {
            if (props.ts && props.ts[0] === tileX && props.ts[1] === tileY) props.sts(null);
            else props.sts([tileX, tileY])
        }
        if (tileX < props.m.width && tileY < props.m.height && props.s) {
            if (e.button === 0) {
                const cannonTiles = oldTiles[tileY][tileX].filter(t => t && t[0] === "C");
                const others = oldTiles[tileY][tileX].filter(t => t && t[0] !== "C");
                // Left button
                var u = false; // Should add cannon tiles?
                var uOverride = false;
                if (props.s === "--") {
                    oldTiles[tileY][tileX] = [];
                    u = true;
                } else if (props.s === "-O") {
                    oldTiles[tileY][tileX] = ["-O"];
                    u = true;
                } else if (props.s === "-C") {
                    // Delete all cannon tiles.
                    uOverride = true;
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
            } else if (e.button === 2) {
                // Right button
                oldTiles[tileY][tileX] = [];
            }
            // Sort the tiles.
            let bTiles = [];
            let pTiles = [];
            let mTiles = [];
            let eTiles = [];
            let tTiles = [];
            if (oldTiles[tileY][tileX].length) for (let i = 0; i < oldTiles[tileY][tileX].length || 0; i++) {
                let tile = oldTiles[tileY][tileX][i];
                if (tile[0] === "B") bTiles.push(tile);
                else if (tile === "PT") pTiles.push(tile);
                else if (conflictingTiles[1].includes(tile)) eTiles.push(tile);
                else if ("G-".split(".").includes(tile)) tTiles.push(tile)
                else mTiles.push(tile);
            }
            oldTiles[tileY][tileX] = bTiles.concat(pTiles, tTiles, mTiles, eTiles)
            setTiles(oldTiles)
            props.st(oldTiles);
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

        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = w;
        canvas.height = h;
        if (!props.l) {
            ctx.fillStyle = "#eeeeee";
            ctx.fillRect(0, 0, w, h);
            return;
        }
        ctx.fillStyle = "#5599ff";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        const tileSize = w / MAX_WIDTH * MAX_HEIGHT > h ? h / MAX_HEIGHT : w / MAX_WIDTH;
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
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        if (w / MAX_WIDTH * MAX_HEIGHT > h) ctx.fillRect(tileSize * MAX_WIDTH, 0, w - tileSize * MAX_WIDTH, h);
        else ctx.fillRect(0, tileSize * MAX_HEIGHT, w, h - tileSize * MAX_HEIGHT);
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
        for (let y = 0; y < MAX_HEIGHT; y++) {
            for (let x = 0; x < MAX_WIDTH; x++) {
                if (!tiles?.[y]?.[x]) continue;
                ctx.fillStyle = "rgba(0,0,0,0.65)"
                if (tiles[y]?.[x].length > 0) ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
                for (let i = 0; i < tiles[y][x].length; i++) {
                    let tile = tiles[y][x][i];
                    let k = tile;
                    if (tiles[y][x].some(o => "*0,*1,*2,*3,*4,*5,*B".split(",").includes(o))) {
                        // +Special?
                        if (tiles[y][x].some(o => "*-,*|,*O,*+".split(",").includes(o))) {
                            if (tile[0] === "*" && !["*/", "*S"].includes(tile)) {
                                k = tiles[y][x].filter(o => "*0,*1,*2,*3,*4,*5,*B".split(",").includes(o))[0] +
                                    tiles[y][x].filter(o => "*-,*|,*O,*+".split(",").includes(o))[0]
                            }
                        }
                    }
                    const d = getDimensions(k);
                    let s = tileSize;
                    const other_90_percents = ["G-", "*S", "PT", "B1", "B2", "B3", "J1", "J2", "J3", "J4"];
                    const is_90_percent = conflictingTiles[1].includes(tile) || other_90_percents.includes(tile);
                    const is_85_percent = tile[0] === "d";
                    let ds = (1 - (is_90_percent ? 0.9 : (is_85_percent ? 0.85 : 0.75))) * tileSize;
                    if (tile === "G2") ds = 0.1 * tileSize;
                    if ("M1.M2.M3.M4.M5.M6".split(".").includes(tile)) ds = 0.15 * tileSize;
                    if ("W1.W2.W3".split(".").includes(tile)) ds = 0.225 * tileSize;

                    if (tile !== "--" && tile !== "-O" && tile[0] !== "C") ctx.drawImage(src, d.x, d.y, d.w, d.h, x * tileSize + ds / 2, y * tileSize + ds / 2, s - ds, s - ds)
                    let t;
                    const validEntryTeleporters = props.teles.filter(o => o.from[0] === x + 1 && o.from[1] === y + 1);
                    if (validEntryTeleporters.length > 0) {
                        let first = validEntryTeleporters[0];
                        let num = props.teles.map((t, ind) => t.from[0]===first.from[0]&&t.from[1]===first.from[1]&&t.to[0]===first.to[0]&&t.to[1]===first.to[1] ? ind : null);
                        // Teleporter Entry
                        t = getDimensions("?1");
                        ds = 0.1 * tileSize;
                        ctx.drawImage(src, t.x, t.y, t.w, t.h, x * tileSize + ds / 2, y * tileSize + ds / 2, s - ds, s - ds);

                        ctx.fillStyle = "rgba(0,0,0,0.7)";
                        ctx.font = "15px Segoe UI";
                        ctx.textAlign = "center";
                        ctx.fillText(num.filter(n => n != null)[0] + 1 , (x + 0.45) * tileSize + ds / 2, (y + 0.9) * tileSize + ds / 2);
                    }
                    const validExitTeleporters = props.teles.filter(o => o.to[0] === x + 1 && o.to[1] === y + 1);
                    if (validExitTeleporters.length > 0) {
                        let first = validExitTeleporters[0];
                        let num = props.teles.map((t, ind) => t.from[0]===first.from[0]&&t.from[1]===first.from[1]&&t.to[0]===first.to[0]&&t.to[1]===first.to[1] ? ind : null);
                        // Teleporter Exit
                        t = getDimensions("?2");
                        ds = 0.1 * tileSize;
                        ctx.drawImage(src, t.x, t.y, t.w, t.h, x * tileSize + ds / 2, y * tileSize + ds / 2, s - ds, s - ds)

                        ctx.fillStyle = "rgba(0,0,0,0.7)";
                        ctx.font = "15px Segoe UI";
                        ctx.textAlign = "center";
                        ctx.fillText(num.filter(n => n != null)[0] + 1, (x + 0.45) * tileSize + ds / 2, (y + 0.1) * tileSize + ds / 2);
                    }
                    let c = 0;
                    ctx.fillStyle = "rgba(0,0,0,0.4)";
                    if (tiles[y][x].some(o => o[0] === "C")) ctx.fillRect(x * tileSize, y * tileSize, tileSize, 0.3 * tileSize);
                    for (let cannon of tiles[y][x].filter(o => o[0] === "C").reverse()) {
                        const d = getDimensions("??" + cannon)
                        const ds = 0.75 * tileSize;
                        const l = tiles[y][x].filter(o => o[0] === "C").length + 1
                        ctx.drawImage(src, d.x, d.y, d.w, d.h, (x + 0.4) * tileSize + ds / 2 - (c * tileSize / l) - 5, (y - 0.35) * tileSize + ds / 2, s - ds, s - ds);
                        c++;
                    }
                    ctx.fillStyle = "rgba(255,255,255,0.15)";
                    if (props.ts && props.ts[0] === x && props.ts[1] === y) ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        }
    }

    useEffect(() => {
        updateTiles(props.t);
    }, [props.m, props.l, props.t, props.ts, props.teles]);

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