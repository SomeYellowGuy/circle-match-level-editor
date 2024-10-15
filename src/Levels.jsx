import { useEffect, useState, useRef } from "react";
import levelThings from "./levelThings";

//const remote = window.require('@electron/remote');
//const fs = remote.require('fs');
//const electronDialog = remote.dialog;

function Levels(props) {

    async function generateHandle() {
        // Get the levels of a directory.
        window.API.fileSystem.readDirLevels().then((ob) => {
            if (!ob.good) return;
            let lns = [];
            for (const level in ob.levels) {
                lns.push([level, soft(ob.levels[level])]);
            }
            let sorted = lns.sort((a,b)=>a[0] - b[0]);
            props.slns(sorted);
            props.selns([ ...sorted ]);
            props.resetFilters();
            // Update the directory.
            props.sd(ob.dir);
        });
    }

    function soft(data) {
        let d = {
            targets: data.targets,
            hard: data.hard || 0,
            colours: data.colours,
            width: data.width || 9,
            height: data.height || 9,
            black: data.black || false,
            increaseColours: data.increaseColours ? true : false,
            immediateShowdown: !data.immediateShowdown ? false : true
        }
        if (data.moves) d.moves = data.moves;
        else if (data.time) d.time = data.time;

        return d;
    }

    function applySelectedLevel(o) {
        window.API.fileSystem.readLevel(o, props.dir).then((data) => {
            if (data.invalid) return;
            if (data && props.dir) {
                props.sl(o)
                load(data);
            }
        });
    }

    function load(d) {
        try {
            // Load various things of the data.
            let pc = { enabled: false };
            // Load preferred colors.
            if (d.preferredColours) {
                pc.enabled = true;
                for (let i = 0; i < levelThings.colors.length; i++) {
                    const p = 1 << i;
                    pc[levelThings.colors[i].toLowerCase()] = ((d.preferredColours & p) === p);
                };
            }
            props.sm({
                timed: !!d.time,
                timemove: d.time || d.moves,
                colours: d.colours,
                preferredColours: d.preferredColours,
                black: d.black,
                width: d.width || 9,
                height: d.height || 9,
                hard: levelThings.hardTypes[d.hard || 0],
                star1: d.targets[0],
                star2: d.targets[1],
                star3: d.targets[2],
                increaseColours: !!d.increaseColours,
                immediateShowdown: d.immediateShowdown ?? true,
                seed: d.seed || 100,
                seedEnabled: d.seed !== null && d.seed !== undefined,
                currentSelectedTele: 1,
                preferredColours: pc,
            });
            // Load cameras.
            let foundCameras = [];
            if (d.camera?.cameras)
            for (let c of d.camera.cameras) {
                foundCameras.push(c);
            }
            // Load cameras' requirements.
            let foundRequirements = [];
            if (d.camera?.requirements)
            for (let r of d.camera.requirements) {
                let req = [];
                for (let i of r) {
                    let g = i.type.replace(/_/g, ' ').split(" ").map(o=>o[0].toUpperCase()+o.slice(1)).join(" ");
                    if (levelThings.layeredGoals.includes(i.type)) g += " (L)";
                    req.push({
                        type: g,
                        complete: i.complete || false,
                        wait: i.wait || false
                    })
                }
                foundRequirements.push(req);
            }
            let cd = {
                enabled: d.camera?.enabled || false,
                width: d.camera?.width || 9,
                height: d.camera?.height || 9,
                showBackwards: (d.camera && ("showBackwards" in d.camera)) ? d.camera.showBackwards : true,
                cameras: foundCameras,
                requirements: foundRequirements
            };
            props.setcd(cd);
            // Load goals.
            let go = [];
            for (let i of d.goals) {
                if (!i.type) return false;
                let g = {};
                if (i.anti) g.anti = true;
                g.type = i.type.replace(/_/g, ' ').split(" ").map(o=>o[0].toUpperCase()+o.slice(1)).join(" ");
                switch (i.type) {
                    case "metal_ball":
                        g.type = "Metal Ball (L)";
                        break;
                    case "watermelon":
                        g.type = "Watermelon (L)";
                        break;
                    case "donut":
                        g.type = "Donut (L)"
                        break;
                    case "button":
                    case "paint":
                    case "ice":
                        g.optional = true;
                }
                g.option = !!(!!g.optional && !!i.amount)
                if (!levelThings.noGoalNumber.includes(i.type)) g.amount = i.amount || 3
                go.push(g)
            }
            let editorTiles = [];
            let tiles = d.tilemap.map(o=>o.split(","));
            let tc = [];
            for (let i = 0; i < 499; i++) tc.push([null, null]);
            for (let y = 0; y < tiles.length; y++) {
                let xt = [];
                for (let x = 0; x < tiles[0].length; x++) {
                    let tileC = tiles[y][x].match(/.{1,2}/g);
                    let ti = [];
                    for (let i = 0; i < tileC.length; i++) {
                        let t = tileC[i]
                        if (t[0] === "T") {
                            let tid = Number((t+tileC[i+1]).slice(1));
                            if (tid % 2 === 0) {
                                // Exit
                                tc[tid/2-1][1] = [x, y];
                            } else {
                                // Enter
                                tc[(tid-1)/2][0] = [x, y];
                            }
                            i++;
                            continue;
                        }
                        else if (t === "-O") ti.push("-O");
                        else if (t !== "--") ti.push(tileC[i]);
                    }
                    let z = ti.sort(((a,b) => (a==="PT" ? -3 : (a[0]==="B" ? -2 : 
                    ("D1,D2,b1,b2,b3".split(",").includes(a) ? 2 :
                    ("G-".split(".").includes(a) ? -1 : 0))))));
                    z = z.sort(((a,b) => -1*((b==="PT" ? -3 : (b[0]==="B" ? -2 : 
                    ("D1,D2,b1,b2,b3".split(",").includes(b) ? 2 :
                    ("G-".split(".").includes(b) ? -1 : 0)))))));
                    xt.push(z)
                }
                editorTiles.push(xt);
            }
            props.sg(go);
            props.st(editorTiles);
            // Load cannons.
            let ca = [];
            if (d.cannons)
            for (let i of structuredClone(d.cannons)) {
                if (!i.type) return false;
                let c = {};
                c.type = i.type.replace(/_/g, ' ').split(" ").map(o=>o[0].toUpperCase()+o.slice(1)).join(" ");
                c.max = i.max;
                c.interval = i.interval || 0;
                if (levelThings.layeredCannons.includes(i.type)) c.layer = i.layer || 1;
                ca.push(c);
            }
            props.sc(ca || [])
            let teleporters = [];
            for (let i = 0; i < tc.length; i++) {
                if (tc[i][0] && tc[i][1]) teleporters.push({from: [...tc[i][0]].map(o=>o+1), to: [...tc[i][1]].map(o=>o+1)})
            }
            props.steles(teleporters);
            // Load spawning.
            let spawnData = [];
            if (d.spawning)
            for (const number of d.spawning) {
                let data = {};
                for (let i = 0; i < levelThings.colors.length; i++) {
                    const p = 1 << i;
                    data[levelThings.colors[i].toLowerCase()] = ((number & p) === p);
                }
                spawnData.push(data);
            }
            props.setspd(spawnData);
            // Load gravitation.
            if (d.gravitationPaths) {
                props.setgd({custom: true, paths: structuredClone(d.gravitationPaths)});
            } else {
                props.setgd({custom: false, paths: []})
            }
        } catch (e) {
            window.alert("An error occured while loading the level: " + e);
            console.warn(e);
        }
    }

    function makeLevelButtons() {
        let comps = props.lns.sort((a, b) => a[0] - b[0]).map(o => {
            const n = o[1].hard || 0;
            return <button 
                className={"LNButton" + (props.l === o[0] ? " LNSel" : (" h" + n + "LNColor"))}
                key={o[0]}
                onClick={() => {
                    applySelectedLevel(o[0])
                }}
        >{o[0]}</button>});
        return comps;
    }

    useEffect(() => {

        function loadLevelsSel() {
            props.loadLevels();
        }

        if (props.inputLevels && props.inputLevels.current) {
            props.inputLevels.current.addEventListener("change", loadLevelsSel, false);
            return function cleanup() {
                props.inputLevels.current.removeEventListener("change", loadLevelsSel, false);
            };
        }
    });

    function openFilterMenu() {
        props.setFGActive(true);
    }

    return (
        <div className="Levels">
            <div>
                <b>Levels</b>
            </div>
            {(typeof window.showDirectoryPicker === "undefined") ?
                (
                <div className="LevelsButton LevelsButtonDiv">
                    <input style={{ display: "none" }} type="file" id="files" webkitdirectory="" directory="" multiple="" ref={props.inputLevels}/>
                    <label htmlFor="files">Select Level Folder</label>
                </div>
                )
                :
                (
                <button className="LevelsButton" onClick={generateHandle}>
                    Select Level Folder
                </button>
                )
            }
            <button className="LevelsButton"  disabled={props.elns.length == 0} onClick={()=>{
                const newLevel = Math.max(...props.lns.map(o => o[0]))+1;
                if (newLevel === -Infinity) return;
                let t = [];
                for (let i = 0; i < 9; i++) {
                    let l = [];
                    for (let j = 0; j < 12; j++) l.push([]);
                    t.push(l)
                }
                props.st(t);
                props.steles([]);
                props.sg([]);
                props.setcd({ enabled: false, cameras: [], requirements: [], width: 9, height: 9, showBackwards: true});
                props.sc([]);
                props.sm({
                    width: 9,
                    height: 9,
                    timemove: 30,
                    timed: false,
                    colours: 4,
                    black: false,
                    preferredColours: { enabled: false },
                    hard: 0,
                    star1: 10000,
                    star2: 20000,
                    star3: 30000,
                    seed: 100,
                    seedEnabled: false,
                    increaseColours: false,
                    immediateShowdown: true
                })
                props.sl(newLevel);
                props.setspd([]);
                props.setgd({custom: false, paths: []})
            }}>
                Create New Level
            </button>
            <div id="LNDiv">
                {props.lns.length > 0 ? makeLevelButtons() : (props.lns.length === 0 ? (
                    props.elns.length > 0 ? "No levels meet the filter!" : "There are no levels! Create one!"
                ) : "Select a folder to get started!")}
            </div>
            <button className="LevelsButton" onClick={openFilterMenu}  disabled={props.elns.length == 0}>
                <i>Filter Levels...</i>
            </button>
        </div>
    )
}

export default Levels;