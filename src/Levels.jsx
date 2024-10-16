import { useEffect, useState, useRef } from "react";
import levelThings from "./levelThings";

//const remote = window.require('@electron/remote');
//const fs = remote.require('fs');
//const electronDialog = remote.dialog;

function Levels(props) {

    const [folderOpened, setFolderOpened] = useState([false, false]);

    async function generateHandle() {
        // Get the levels of a directory.
        window.API.fileSystem.readDirLevels().then((ob) => {
            if (!ob.good) return;
            let lns = [];
            for (const level in ob.levels) {
                if (props.nightMode && !ob.levels[level].night) {
                    props.setAlertContent({
                        title: "Alert",
                        content: "It looks like you are trying to upload a folder containing normal levels as the night level folder. Therefore, the upload has been stopped to prevent further errors."
                    })
                    props.setAlertActive(true);
                    return;
                } else if (!props.nightMode && ob.levels[level].night) {
                    props.setAlertContent({
                        title: "Alert",
                        content: "It looks like you are trying to upload a folder containing night levels as the normal level folder. Therefore, the upload has been stopped to prevent further errors."
                    })
                    props.setAlertActive(true);
                    return;
                }
                lns.push([level, soft(ob.levels[level])]);
            }
            let sorted = lns.sort((a,b)=>a[0] - b[0]);

            if (props.nightMode) {
                props.snlns(sorted);
                props.snelns([ ...sorted ]);
                setFolderOpened([folderOpened[0], true]);

                // Update the directory.
                props.sd([props.dir[0], ob.dir]);
            } else {
                props.slns(sorted);
                props.selns([ ...sorted ]);
                setFolderOpened([true, folderOpened[1]]);

                // Update the directory.
                props.sd([ob.dir, props.dir[1]]);
            }

            props.resetFilters();
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
            immediateShowdown: !data.immediateShowdown ? false : true,
            night: data.night ?? false
        }
        if (data.moves) d.moves = data.moves;
        else if (data.time) d.time = data.time;

        return d;
    }

    function getCorrectDir() {
        return props.dir[props.nightMode ? 1 : 0];
    }

    function applySelectedLevel(o) {
        window.API.fileSystem.readLevel(o, getCorrectDir()).then((data) => {
            if (data.invalid) return;
            if (data && getCorrectDir()) {
                props.sl(o)
                load(data);
            }
        });
    }

    useEffect(() => {
        props.sl(null);
    }, [props.nightMode])

    function extractGoals(goals) {
        let go = [];
        for (let i of goals) {
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
            if (props.nightMode || !levelThings.noGoalNumber.includes(i.type)) g.amount = i.amount || 3
            go.push(g)
        }
        return go;
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
                star1: props.nightMode ? undefined : d.targets[0],
                star2: props.nightMode ? undefined : d.targets[1],
                star3: props.nightMode ? undefined : d.targets[2],
                increaseColours: !!d.increaseColours,
                immediateShowdown: props.nightMode ? undefined : (d.immediateShowdown ?? true),
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
            if (props.nightMode) {
                if (!d.moonGoals) {
                    console.error("No moon goals found!");
                    return;
                }
                let mgo = [
                    extractGoals(d.moonGoals[0]),
                    extractGoals(d.moonGoals[1]),
                    extractGoals(d.moonGoals[2])
                ]
                props.smg(mgo);
            } else {
                let go = extractGoals(d.goals);
                props.sg(go);
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
        let comps = from().sort((a, b) => a[0] - b[0]).map(o => {
            const n = props.nightMode ? 10 : (o[1].hard || 0);
            return <button 
                className={"LNButton" + (props.l === o[0] ? " LNSel" : (" h" + n + "LNColor"))}
                key={o[0]}
                onClick={() => {
                    applySelectedLevel(o[0])
                }}
        >{o[0]}</button>});
        return comps;
    }

    function createSwitch() {
        let buttons = [];
        buttons.push(
            <button className={"LevelsSwitch " + (!props.nightMode ? "selected" : "")} key={0} id="star" onClick={() => {props.setNightMode(false)}}>{levelThings.star}</button>
        )
        buttons.push(
            <button className={"LevelsSwitch " + (props.nightMode ? "selected" : "")} key={1} id="moon" onClick={() => {props.setNightMode(true)}}>{levelThings.moon}</button>
        )
        return buttons;
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

    function from() {
        return props.nightMode ? [ ...props.nlns ] : [ ...props.lns ]
    }

    function eFrom() {
        return props.nightMode ? [ ...props.nelns ] : [ ...props.elns ]
    }

    return (
        <div className="Levels">
            <div>
                <b>Levels</b>
            </div>
            {
                (
                <>
                    <button className="LevelsButton" onClick={generateHandle}>
                        Select {props.nightMode ? "☾" : ""} Level Folder
                    </button>
                    {createSwitch()}
                </>
                )
            }
            <button className="LevelsButton"  disabled={(props.nightMode) ? (!folderOpened[1]) : (!folderOpened[0])} onClick={()=>{
                let newLevel = -Infinity;
                if (from().length > 0) newLevel = Math.max(from().map(o => o[0]))+1;
                else if ((props.nightMode) ? (folderOpened[1]) : (folderOpened[0])) newLevel = 1;

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
                { props.nightMode ? 
                    (props.nlns.length > 0 ? makeLevelButtons() : (props.nlns.length === 0 ? (
                        props.nelns.length > 0 ? "No levels meet the filter!" : "There are no levels! Create one!"
                    ) : "Select a folder to get started!"))
                    :
                    (props.lns.length > 0 ? makeLevelButtons() : (props.lns.length === 0 ? (
                        props.elns.length > 0 ? "No levels meet the filter!" : "There are no levels! Create one!"
                    ) : "Select a folder to get started!"))
                }
            </div>
            <button className="LevelsButton" onClick={openFilterMenu}  disabled={eFrom().length == 0}>
                <i>Filter Levels...</i>
            </button>
        </div>
    )
}

export default Levels;