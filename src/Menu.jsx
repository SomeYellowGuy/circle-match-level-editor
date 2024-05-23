import { useEffect, useState } from "react";
import tooltips from "./Tooltips.js";
import conflictingTiles from "./conflicts.js"
import levelThings from "./levelThings.js";

function Menu(props) {
    const [menuState, setMS] = useState({
        timed: false,
        timemove: 30,
        colours: 4,
        black: false,
        width: 9,
        height: 9,
        hard: "Normal Level",
        star1: 10000,
        star2: 20000,
        star3: 30000,
        increaseColours: false,
        immediateShowdown: true,
        camera: { enabled: false },
        cannons: [],
        preferredColours: { enabled: false }
    });

    const [cameraData, setCameraData] = useState({
        enabled: false,
        cameras: [],
        showBackwards: true,
        requirements: [],
		width: 9,
		height: 9
    })

    const [spawnData, setSpawnData] = useState([]);

    let [R, setR] = useState(0)

    let [currentTab, setCurrentTab] = useState("properties");

    const [goals, setGoals] = useState([]);
    const [teleporters, setTeles] = useState([]);
    const [cannons, setCannons] = useState([]);

    function handleChange(c, v, isCheckbox, specialData) {
        let MS;
        MS = specialData === "camera" ? { ...cameraData } : { ...menuState };
        MS[c] = isNaN(Number(v)) || isCheckbox ? v : Number(v);
        // What about width and height?
        switch (specialData) {
            case "camera":
                if (c == "enabled" && !v) {
                    // Set width and height back.
                    let s = { ...menuState }
                    s.width = Math.min(s.width, 12);
                    s.height = Math.min(s.height, 9);
                    setMS(s);
                    props.sm(s);
                }
                setCameraData(MS);
                props.setcd(MS);
                break;
            default:
                if (c === "width") {
                    // WIDTH changed
                    let newTiles = props.t;
                    if (newTiles[0].length < v) {
                        // Add a new tile to each array.
                        for (let i = 0; i < newTiles.length; i++) newTiles[i].push([]);
                    }
                } else if (c === "height") {
                    // HEIGHT changed.
                    let newTiles = props.t;
                    if (newTiles.length < v) {
                        // Add a new array.
                        let n = [];
                        for (let i = 0; i < newTiles[0].length; i++) n.push([]);
                        newTiles.push(n)
                    }
                }
                setMS(MS);
                props.sm(MS);
        }
    }

    function makeSec(name) {
        return <div className="MenuSectionDiv"><b style={{
            fontWeight: 700,
            fontSize: "40px",
            margin: "10px"
        }}>{name}</b>
        </div>
    }

    function makeSubSec(name) {
        return <div className="MenuSectionDiv"><b style={{
            fontWeight: 400,
            fontSize: "25px",
            margin: "10px"
        }}>{name}</b>
        </div>
    }

    function makeSubSubSec(name) {
        return <div className="MenuSectionDiv"><i><b style={{
            fontWeight: 300,
            fontSize: "20px",
            margin: "10px",
        }}>{name}</b></i>
        </div>
    }

    function makeInfo(info, isSmall) {
        let list = [];
        let i = 0;
        for (const line of info.split("\n")) {
            list.push(<li key={i++}>{line}</li>);
        }
        return (<div className={isSmall ? "MenuInfoSmall" : "MenuInfo"}>
            <ul>{list}</ul>
        </div>);
    }

    function makeField(name, type, p, specialData) {
        let items = [];
        let data = specialData === "camera" ? cameraData[p.code] : menuState[p.code]
        let disabled = specialData === "camera" && !cameraData.enabled && p.code !== "enabled";
        if (!specialData && (p.code === "colours" || p.code === "black")) {
            disabled = menuState.preferredColours.enabled;
        }
        if (!specialData && p.code === "seed") disabled = !menuState.seedEnabled;
        switch (type) {
            case "checkbox":
                // Extra params: dc
                items.push(<div>
                    <label htmlFor="input" className="MenuAreaLabel">{name}<input type="checkbox" className="MenuAreaField"
                        onChange={(e) => handleChange(p.code, e.target.checked, true, specialData)} checked={data} disabled={disabled} /></label>
                </div>);
                return <div className="MenuArea" key={p.code}>{items}</div>;
            case "num":
                // Extra params: min, max, step, code, width
                items.push(<div>
                    <label htmlFor="quantity" className={"MenuAreaLabel"}>{name}<input type="number"
                        className={"MenuAreaField"} onChange={(e) => handleChange(p.code, e.target.value, false, specialData)}
                        disabled={disabled}
                        min={p.min} max={p.max} step={p.step} value={data} style={{
                            width: p.width + "%"
                        }} /></label>
                </div>);
                return <div className="MenuArea" key={p.code}>{items}</div>;
            case "dropdown":
                // Extra params: options, styled
                let options = [];
                for (let i = 0; i < p.options.length; i++) {
                    let option = p.options[i];
                    let style = null;
                    if (p.styled) style = p.styled[i];
                    options.push(<option key={i} style={{
                        backgroundColor: style,
                        color: p.outlineStyled[i]
                    }}>{option}</option>)
                }
                items.push(<div>
                    <label htmlFor="quantity" className="MenuAreaLabel">{name}
                        <select
                            className="MenuAreaField" onChange={(e) => handleChange(p.code, e.target.value, false, specialData)}
                            value={data} style={{
                                width: p.width + "%"
                            }}
                            disabled={disabled}>
                            {options}
                        </select>
                    </label>
                </div>);
                return <div className="MenuArea" key={p.code}>{items}</div>;
        }
    }

    function makeSpecial(spec) {
        let items = [];
        switch (spec) {
            case "wh":
                return <div className="MenuWHField MenuAreaEDLabel">
                    <label htmlFor="quantity">Width<input type="number" className="MenuWHFieldNum"
                        onChange={(e) => handleChange("width", e.target.value)}
                        min={1} max={props.cd.enabled ? 256 : 12} step={1} value={menuState.width} style={{
                            width: "16%"
                        }} /></label>
                    <label htmlFor="quantity" id="MenuHeight">Height<input type="number" className="MenuWHFieldNum"
                        onChange={(e) => handleChange("height", e.target.value)}
                        min={1} max={props.cd.enabled ? 256 : 9} step={1} value={menuState.height} style={{
                            width: "16%"
                        }} /></label>
                </div>
            default: return <></>
        }
    }

    function addGoal() {
        // Create a goal.
        let oldGoals = [...goals];
        oldGoals.push({
            type: "Score"
        });
        setGoals(oldGoals)
        props.sg(oldGoals)
    }

    function addTele() {
        // Create a teleporter.
        // There is a maximum of 499 pairs of teleporters.
        // T001, T002 - T003, T004 - ... - T997, T998
        if (teleporters.length >= 499) return;
        let oldTeles = [...teleporters];
        oldTeles.push({
            from: [1, 1],
            to: [1, 1]
        });
        props.setsct(String(Number(oldTeles.length)));
        setTeles(oldTeles);
        props.steles(oldTeles);
    }

    function addCannonData() {
        // Create cannon data.
        let c = [...cannons];
        c.push({
            type: "watermelon",
            layer: 1,
            max: 5,
            interval: 0
        });
        setCannons(c);
        props.sc(c);
    }

    function removeGoal(i) {
        // Remove the goal.
        let oldGoals = [...goals];
        oldGoals.splice(i, 1);
        setGoals(oldGoals)
        props.sg(oldGoals)
    }

    function removeTele(i) {
        // Remove the teleporters.
        let oldTeles = [...teleporters];
        oldTeles.splice(i, 1);
        setTeles(oldTeles)
        props.steles(oldTeles);
    }

    function removeCannon(i) {
        // Remove the cannon data.
        let c = [...cannons];
        c.splice(i, 1);
        setCannons(c)
        props.sc(c);
    }

    function changeGoalAttribute(n, attrib, to, c) {
        let g = [...goals];
        if (c) g[n][attrib] = !g[n][attrib];
        g[n][attrib] = typeof to !== "number" ? to : Number(to);
        const optionalAmount = ["button", "paint"];
        const noAmount = ["score"];
        if (attrib === "type") {
            g[n].optional = optionalAmount.includes(to.toLowerCase());
            g[n].option = false;
            if (noAmount.includes(to.toLowerCase())) g[n].amount = null;
            if (!g[n].amount && g[n].optional) g[n].amount = 3;
            else if (!optionalAmount.includes(to.toLowerCase()) && !g[n].amount) g[n].amount = 3;
        }
        setGoals(g);
        props.sg(g);
    }

    function changeCAttribute(n, attrib, to) {
        let g = [...cannons];
        g[n][attrib] = attrib === "type" ? to : Number(to);
        if (attrib === "type" && levelThings.layeredCannons.includes(to.toLowerCase())) g[n].layer = 1;
        else if (attrib === "type") g[n].layer = undefined;
        setCannons(g);
        props.sc(g);
    }

    function getC(t) {
        t = t.toLowerCase();
        if (t === "score") return "#ff9999";
        if (t === "button") return "#99ddff";
        if (t === "globe") return "#99ffcc";
        if (t === "paint") return "#f3e830";
        return "#ff77ff";
    }

    function makeTeleporters() {
        let items = [];
        // Make an Add Goal button.
        items.push(<button id="MenuGoalAdd" onClick={addTele} key={0}>
            Add Teleporters
        </button>)
        items.push(<button id="MenuGoalAdd" onClick={() => {
            removeTele(props.sct - 1)
        }} key={1}>
            Delete Selected Teleporters
        </button>)

        items.push(<div>
            <label htmlFor="quantity" key={2} className={"MenuAreaLabel"}>Selected ID
                    <input type="number"
                        className={"MenuTele"} onChange={(e) => {
                            props.setsct(e.target.value);
                        }}
                        min={0} max={teleporters.length} step={1} value={props.sct} style={{
                            width: "80%"
                        }} />                               </label>
        </div>);

        items.push(makeInfo(
            `On this tab, perform these to place:
            Left click: an ENTRY teleporter
            Right click: an EXIT teleporter`
        ))

        return items;
    }

    function makeGoals(go) {
        go = goals;
        let items = [];
        // Make an Add Goal button.
        items.push(<button id="MenuGoalAdd" onClick={addGoal} key={0}>
            Add Goal
        </button>)
        // Render the goals.
        const gt = levelThings.goals;
        for (let i = 0; i < go.length; i++) {
            let goal = go[i];
            let goalTypes = [];
            let goalItems = [];
            for (let j = 0; j < gt.length; j++) goalTypes.push(<option key={j} style={{
                backgroundColor: getC(gt[j]),
                color: "black"
            }}>{gt[j]}</option>)
            goalItems.push(<button className="MenuGoalRemove" onClick={() => removeGoal(i)}>×</button>)
            goalItems.push(<label className="MenuAreaLabel">Type
                <select
                    className="MenuAreaField" onChange={(e) => changeGoalAttribute(i, "type", e.target.value)}
                    value={goal.type} style={{
                        width: "62%"
                    }}>
                    {goalTypes}
                </select>
            </label>
            )
            goalItems.push(<div style={{ fontSize: "12px", wordSpacing: "2px", lineHeight: 1 }}>{tooltips.goals[goal.type.toLowerCase()]}</div>)
            if (goal.optional) goalItems.push(<div>
                <label htmlFor="input" className={"MenuAreaLabel"}>Specific?<input type="checkbox"
                    className={"MenuAreaField"} onChange={(e) => changeGoalAttribute(i, "option", e.target.checked, true)}
                    min={1} max={Infinity} step={1} checked={goal.option} style={{
                        width: "40%"
                    }} /></label>
            </div>);
            if (goal.amount) goalItems.push(<div>
                <label htmlFor="quantity" className={"MenuAreaLabel"}>Amount<input type="number"
                    className={"MenuAreaField"} onChange={(e) => changeGoalAttribute(i, "amount", e.target.value)}
                    min={1} max={Infinity} step={1} value={goal.amount} disabled={goal.optional && !goal.option} style={{
                        width: "40%"
                    }} /></label>
            </div>);
            items.push(
                <div key={i + 1} className="MenuGoal" style={{
                    height: ((goal.optional ? 18 : (goal.amount ? 10 : 5)) + 7) + "%"
                }}>
                    {goalItems}
                </div>);
        }
        return items;
    }

    function makeCannons() {
        let items = [];
        // Make an Add Cannon Data button.
        items.push(<button id="MenuGoalAdd" onClick={addCannonData} key={0}>
            Add Cannon Data
        </button>)
        // Render the cannon data structures.
        const gt = levelThings.cannonTypes;
        for (let i = 0; i < cannons.length; i++) {
            let c = cannons[i];
            let cItems = [];
            let goalTypes = [];
            for (let j = 0; j < gt.length; j++) goalTypes.push(<option key={j} style={{
                backgroundColor: "white",
                color: "black"
            }}>{gt[j]}</option>)
            cItems.push(<button className="MenuGoalRemove" onClick={() => removeCannon(i)}>×</button>)
            cItems.push(<label className="MenuAreaLabel">Type
                <select
                    className="MenuAreaField" onChange={(e) => changeCAttribute(i, "type", e.target.value)}
                    value={c.type} style={{
                        width: "62%"
                    }}>
                    {goalTypes}
                </select>
            </label>
            )
            cItems.push(<div>
                <label htmlFor="input" className={"MenuAreaLabel"}>Maximum<input type="number"
                    className={"MenuAreaField"} onChange={(e) => changeCAttribute(i, "max", e.target.value)}
                    min={0} max={Infinity} step={1} value={c.max} style={{
                        width: "30%"
                    }} /></label>
            </div>);
            if (c.layer) cItems.push(<div>
                <label htmlFor="quantity" className={"MenuAreaLabel"}>Layer<input type="number"
                    className={"MenuAreaField"} onChange={(e) => changeCAttribute(i, "layer", e.target.value)}
                    min={1} max={10} step={1} value={c.layer} style={{
                        width: "30%"
                    }} /></label>
            </div>);
            cItems.push(<div>
                <label htmlFor="input" className={"MenuAreaLabel"}>Interval<input type="number"
                    className={"MenuAreaField"} onChange={(e) => changeCAttribute(i, "interval", e.target.value)}
                    min={1} max={Infinity} step={1} value={c.interval} style={{
                        width: "30%"
                    }} /></label>
            </div>);
            items.push(
                <div key={i + 1} className="MenuGoal" style={{
                    height: c.layer ? "23%" : "19%"
                }}>
                    {cItems}
                </div>);
        }
        items.push(
            makeInfo("An interval of 0 means it will always try spawning something.")
        )
        return items;
    }

    useEffect(() => {
        setMS(props.m)
        setGoals(props.g)
        setR(r => r + 1);
        setTeles(props.teles);
        setCannons(props.c);
        props.setmct(currentTab);
        setCameraData(props.cd);
        setSpawnData(props.spd);
        return () => { };
    }, [props.l, props.cd, props.spd, menuState, currentTab, props.m, props.g, props.teles, props.c]);

    function saveLevel() {
        // Make basic metadata.
        let data = {
            moves: props.m.timed ? undefined : props.m.timemove,
            time: props.m.timed ? props.m.timemove : undefined,
            targets: [props.m.star1, props.m.star2, props.m.star3],
            width: props.m.width === 9 ? undefined : props.m.width,
            height: props.m.height === 9 ? undefined : props.m.height,
            colours: props.m.colours,
            black: props.m.black,
            hard: Math.max(0, levelThings.hardTypes.indexOf(props.m.hard)),
            immediateShowdown: !props.m.immediateShowdown ? false : undefined,
            increaseColours: props.m.increaseColours ? true : undefined,
            seed: props.m.seedEnabled ? props.m.seed : undefined
        }
        // Goals!
        let goals = props.g
        let dataGoals = goals.map(o=>({
            type: o.type.slice(-3) === "(L)" ? o.type.replace(/ /g, '_').toLowerCase().slice(0, -4) :
                    o.type.replace(/ /g, '_').toLowerCase(),
            amount: (o.optional ? (o.option ? Number(o.amount) : null) : Number(o.amount) || null)
        }));
        data.goals = dataGoals;
        // Tiles.
        let tilemap = [];
        for (let y = 0; y < props.m.height; y++) {
            let row = [];
            for (let x = 0; x < props.m.width; x++) {
                let tile = props.t[y][x];
                let o = "";
                if (tile.length === 0) o = "--"                             // None
                else o = tile.join("");
                if (!tile.some(o=>conflictingTiles[0].includes(o) ||
                    o === "-O") && tile.length > 0) 
                            o += "-O";
                for (let te in teleporters) {
                    let t = teleporters[te]
                    if (t.from[0]===x+1&&t.from[1]===y+1) {
                        o += "T"+"000".slice(String(te*2+1).length)+String(te*2+1)
                    }
                    if (t.to[0]===x+1&&t.to[1]===y+1) {
                        o += "T"+"000".slice(String(te*2+2).length)+String(te*2+2)
                    }
                }
                row.push(o)
            }
            tilemap.push(row.join(","))
        }
        data.tilemap = tilemap;
        data.cannons = cannons.map(o=>({
            type: o.type.toLowerCase().split(" ").join("_"),
            max: o.max,
            interval: o.interval,
            layer: o.layer
        }));
        // Add camera data if required.
        if (cameraData.enabled) {
            const requirements = structuredClone(cameraData.requirements);
            data.camera = structuredClone(cameraData);
            delete data.camera.requirements;
            let reqs = [];
            for (const req of requirements) {
                let r = req.map(o=>{
                    let s = {
                        type: o.type.slice(-3) === "(L)" ? o.type.replace(/ /g, '_').toLowerCase().slice(0, -4) :
                            o.type.replace(/ /g, '_').toLowerCase(),
                        complete: o.complete || false,
                        wait: o.wait || false
                    }
                    if (!s.complete) delete s.complete;
                    if (!s.wait) delete s.wait;
                    return s;
                })
                reqs.push(r);
            }
            data.camera.requirements = reqs;
        }
        // Spawning!
        if (spawnData.length > 0) {
            data.spawning = [];
            // Save the following as per:
            // Red: +1
            // Blue: +2
            // ...
            // Black: +64
            for (const d of structuredClone(spawnData)) {
                let number = 0;
                for (const color in d) {
                    if (d[color]) {
                        const pow = levelThings.colors.map(o => o.toLowerCase()).indexOf(color);
                        number += (1 << pow);
                    }
                }
                data.spawning.push(number);
            }
        }
        let number = 0;
        for (const color in structuredClone(props.m.preferredColours)) {
            if (props.m.preferredColours[color]) {
                const pow = levelThings.colors.map(o => o.toLowerCase()).indexOf(color);
                number += (1 << pow);
            }
        }
        data.preferredColours = number;
        // Allow the user to save!
        window.API.fileSystem.saveLevel(props.l, props.dir, data).then(() => {})
        if (!props.lns.some(o => o[0] === props.l)) {
            props.slns(props.lns.concat([[props.l, data.hard]]))
        }
    }
    
    function makeTabs() {
        return levelThings.levelTabs.map((o, i) => {
            const k = o.toLowerCase();
            const selected = (!currentTab && k === "properties") || currentTab === k;
            return <button className={"MenuTab" + (selected ? " MenuSelectedTab" : "")} key={i} onClick={() => {
                if (o !== "???") setCurrentTab(o.toLowerCase())
                }
            }>
                {o}
            </button>
        })
    }

    function addNewRequirement(camera, req) {
        let r = cameraData.requirements;
        while (r.length <= camera) {
            r.push([]);
        }
        r[camera].push({
            type: req,
            complete: false,
            wait: false
        });
        setCameraData({
            enabled: true,
            width: cameraData.width,
            height: cameraData.height,
            cameras: [ ...cameraData.cameras ],
            requirements: r,
            showBackwards: cameraData.showBackwards
        });
    }

    function removeRequirement(camera, req) {
        let r = cameraData.requirements;
        while (r.length <= camera) {
            r.push([]);
        }
        r[camera].splice(req, 1);
        setCameraData({
            enabled: true,
            width: cameraData.width,
            height: cameraData.height,
            cameras: [ ...cameraData.cameras ],
            requirements: r,
            showBackwards: cameraData.showBackwards
        });
    }

    function changeRequirementAttribute(camera, req, attrib, value) {
        let r = cameraData.requirements;
        while (r.length <= camera) {
            r.push([]);
        }
        r[camera][req][attrib] = value;
        setCameraData({
            enabled: true,
            width: cameraData.width,
            height: cameraData.height,
            cameras: [ ...cameraData.cameras ],
            requirements: r,
            showBackwards: cameraData.showBackwards
        });
    }

    function makeRequirements() {
        let list = [];
        let availableRequirements = [];
        const gt = levelThings.goals;
        for (let j = 0; j < gt.length; j++) {
            if (levelThings.notReqs.includes(gt[j])) continue;
            availableRequirements.push(<option key={j} style={{
                backgroundColor: getC(gt[j]),
                color: "black"
            }}>{gt[j]}</option>);
        }

        for (let i = 0; i < cameraData.cameras.length; i++) {
            list.push(makeSubSec("Camera #" + (i+1)));
            if (i !== cameraData.cameras.length - 1) {
                list.push(makeSubSubSec("Requirements"));
                list.push(<button id="MenuGoalAdd" onClick={() => {addNewRequirement(i, "Button")}} key={i}>
                    Add New Requirement
                </button>)
                // Show every requirement.
                const requirements = cameraData.requirements[i];
                if (requirements)
                for (let j = 0; j < requirements.length; j++) {
                    let items = [];
                    const t = requirements[j];
                    items.push(<button className="MenuGoalRemove" onClick={() => removeRequirement(i, j)} key={1}>×</button>)
                    items.push(<label className="MenuAreaLabel" key={2}>Type
                        <select
                            className="MenuAreaField" onChange={(e) => changeRequirementAttribute(i, j, "type", e.target.value)}
                            value={t.type} style={{
                                width: "62%"
                            }}>
                            {availableRequirements}
                        </select>
                    </label>)
                    items.push(<div>
                        <label htmlFor="input" className={"MenuAreaLabel"} key={3}>Complete?<input type="checkbox"
                            className={"MenuAreaField"} onChange={(e) => changeRequirementAttribute(i, j, "complete", e.target.checked)}
                            min={1} max={Infinity} step={1} checked={t.complete} style={{
                                width: "40%"
                            }} disabled={t.wait}/></label>
                    </div>);
                    if (t.type === "Globe")
                    items.push(<div>
                        <label htmlFor="input" className={"MenuAreaLabel"} key={4}>Wait?<input type="checkbox"
                            className={"MenuAreaField"} onChange={(e) => changeRequirementAttribute(i, j, "wait", e.target.checked)}
                            min={1} max={Infinity} step={1} checked={t.wait} style={{
                                width: "40%"
                            }} disabled={t.complete}/></label>
                    </div>);
                    list.push(<div className="MenuGoal" style={{
                        height: ((t.type === "Globe") ? 16 : 12) + "%"
                    }}>
                        {items}
                    </div>);
                }
            } else {
                list.push(makeInfo(`No requirements may be set for the final camera.`, true))
            }
        }
        return list;
    }

    function addSpawn() {
        if (spawnData.length < 9) {
            let d = [ ...spawnData ];
            d.push({});
            setSpawnData(d);
            props.setspd(d);
        }
    }

    function removeSpawn(i) {
        let d = [ ...spawnData ];
        d.splice(i, 1);
        setSpawnData(d);
        props.setspd(d);
    }

    function changeSpawnAttribute(i, color, value) {
        if (i === -1) {
            // Edit the preferred color instead.
            let s = structuredClone(menuState);
            s.preferredColours[color.toLowerCase()] = value;
            setMS(s);
            props.sm(s);
        } else {
            let d = [ ...spawnData ];
            d[i][color.toLowerCase()] = value;
            setSpawnData(d);
            props.setspd(d);
        }
    }

    function makeSpawns() {
        let items = [];
        // Preferred Colors
        let spawn = [];
        items.push(makeSubSec("Preferred Colo(u)rs"));
        items.push(<div style={{height: "6%"}}>
            <label htmlFor="input" className={"MenuAreaLabel"} style={{top: "50%",  marginTop: "3%"}}>Enabled?<input type="checkbox"
                className={"MenuAreaField"} onChange={(e) => changeSpawnAttribute(-1, "enabled", e.target.checked)}
                checked={menuState.preferredColours.enabled} style={{
                    width: "40%",
                }} /></label>
        </div>);
        for (const color of levelThings.colors) {
            spawn.push(<div>
                <label htmlFor="input" className={"MenuAreaLabel"} key={color}>{color}<input type="checkbox"
                    className={"MenuAreaField"} onChange={(e) => changeSpawnAttribute(-1, color, e.target.checked)}
                    checked={menuState.preferredColours[color.toLowerCase()] || false} style={{
                        width: "40%"
                    }} disabled={!menuState.preferredColours.enabled}/></label>
            </div>);
        }
        items.push(<div className="MenuGoal" style={{
            height: "33%"
        }}>
            {spawn}
        </div>)

        // Custom Spawns
        items.push(makeSubSec("Custom Spawning"));
        items.push(<button id="MenuGoalAdd" onClick={addSpawn}>
            Add Spawn Configuration
        </button>)
        for (let i = 0; i < spawnData.length; i++) {
            const data = spawnData[i];
            let spawn = [];
            items.push(makeSubSec("Configuration #" + (i+1)));
            spawn.push(<button className="MenuGoalRemove" onClick={() => removeSpawn(i)} key="remove">×</button>)

            for (const color of levelThings.colors) {
                spawn.push(<div>
                    <label htmlFor="input" className={"MenuAreaLabel"} key={color}>{color}<input type="checkbox"
                        className={"MenuAreaField"} onChange={(e) => {changeSpawnAttribute(i, color, e.target.checked)}}
                        checked={data[color.toLowerCase()] || false} style={{
                            width: "40%"
                        }}/></label>
                </div>);
            }

            items.push(<div className="MenuGoal" style={{
                height: "37%"
            }}>
                {spawn}
            </div>)
        }
        return items;
    }

    function getFilteredTab() {
        const notTeleporters = currentTab !== "teleporters";
        if (notTeleporters) {
            props.setsct(0);
        }
        switch (currentTab) {
            case "goals":
                return [makeSec("Goals"), makeGoals(goals)];
            case "cannons":
                return [makeSec("Cannons"), makeCannons()];
            case "teleporters":
                return [makeSec("Teleporters"), makeTeleporters()];
            case "camera":
                return [
                    makeSec("Camera"),
                    makeField("Enabled?", "checkbox", { code: "enabled", dc: false }, "camera"),
                    makeField("Camera Width", "num", { code: "width", min: 1, max: 12, step: 2, value: 9, width: 20 }, "camera"),
                    makeField("Camera Height", "num", { code: "height", min: 1, max: 9, step: 2, value: 9, width: 20 }, "camera"),
                    makeField("Show Backwards", "checkbox", { code: "showBackwards", dc: true }, "camera"),
                    makeRequirements()
                ];
            case "spawning":
                return [makeSec("Spawning"), makeSpawns(), makeInfo(`Add a new spawn configuration to set what circles spawn for that number.`)];
            case "miscellanous":
                return [
                    makeSec("Miscellanous"),
                    makeField("Enable seed?", "checkbox", { code: "seedEnabled", dc: true }),
                    makeField("Seed", "num", { min: -2147483648, max: 2147483647, step: 1, value: 100, width: 40, code: "seed" })
                ]
            // Default: Properties.
            default:
                return [
                    makeSec("Properties"),
                    makeField("Timed?", "checkbox", { code: "timed", dc: false }),
                    makeField(menuState.timed ? "Time (seconds)" : "Moves", "num", { min: 1, max: 65535, step: 1, value: 30, width: 20, code: "timemove" }),
                    makeField("Colo(u)rs", "num", { min: 1, max: 6, step: 1, value: 4, width: 13, code: "colours" }),
                    makeField("Include Black Circles", "checkbox", { code: "black", dc: false }),
                    makeSpecial("wh"),
                    makeField("Difficulty", "dropdown", {
                        options: levelThings.hardTypes, styled: ["#999999", "#ff8800", "#ff0033", "#333333", "#222c33"],
                        outlineStyled: ["black", "black", "white", "white", "white"], width: 56, code: "hard"
                    }),

                    makeField(<><strong style={{ color: "#ff3333" }}>★ </strong>Target</>, "num", { min: 1, max: 4294967295, step: 1, value: 10000, width: 50, code: "star1" }),
                    makeField(<><strong style={{ color: "#22bb22" }}>★ </strong>Target</>, "num", { min: 1, max: 4294967295, step: 1, value: 20000, width: 50, code: "star2" }),
                    makeField(<><strong style={{ color: "#ffbb00" }}>★ </strong>Target</>, "num", { min: 1, max: 4294967295, step: 1, value: 30000, width: 50, code: "star3" }),
                    makeField("Increase colo(u)rs?", "checkbox", { code: "increaseColours", dc: false }),
                    makeField("Immediate showdown?", "checkbox", { code: "immediateShowdown", dc: true })
                ]
        }
    }

    return (
        <div className="Menu">
            <b>Menu</b>
            <br />
            {(!props.l) ? "Select a level!" : <>
                <div>{"Level " + props.l}</div>
                <button id="MenuGoalAdd" onClick={saveLevel} key={0}>
                    Save Level
                </button>
                {makeTabs()}
                {getFilteredTab()}
            </>
            }
        </div>
    )
}

export default Menu;