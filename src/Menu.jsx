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
        preferredColours: { custom: false }
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

    const [gravitationData, setGravitationData] = useState({ custom: false, paths: [] });

    let [R, setR] = useState(0)

    let [currentTab, setCurrentTab] = useState("properties");

    const [goals, setGoals] = useState([]);
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

    function makeInfo(info, isSmall, isBig, isVeryBig) {
        let list = [];
        let i = 0;
        for (const line of info.split("\n")) {
            list.push(<li key={i++}>{line}</li>);
        }
        return (<div className={isVeryBig ? "MenuInfoVeryBig" : (isBig ? "MenuInfoBig" : (isSmall ? "MenuInfoSmall" : "MenuInfo"))}>
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
        if (p.night && !props.nightMode) return;
        if ((p.code === "hard" || p.code.startsWith("star") || p.code === "immediateShowdown") && (props.nightMode && !p.night)) {
            // No difficulty setting  or score targets in night levels.
            return;
        }
        switch (type) {
            case "checkbox":
                // Extra params: dc
                items.push(<div>
                    <label htmlFor="input" className="MenuAreaLabel">{name}<input type="checkbox" className="MenuAreaField"
                        onChange={(e) => handleChange(p.code, e.target.checked, true, specialData)} checked={data} disabled={disabled} /></label>
                </div>);
                return <div className="MenuArea" key={p.code + (p.night ? "night" : "")}>{items}</div>;
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
                return <div className="MenuArea" key={p.code + (p.night ? "night" : "")}>{items}</div>;
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
                return <div className="MenuArea" key={p.code + (p.night ? "night" : "")}>{items}</div>;
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

    function addGoal(moon) {
        // Create a goal.
        if (props.nightMode) {
            let oldGoals = [...props.mg];
            oldGoals[moon].push({
                type: "Score",
                amount: 100
            });
            props.smg(oldGoals)
        } else {
            let oldGoals = [...goals];
            oldGoals.push({
                type: "Score"
            });
            setGoals(oldGoals)
            props.sg(oldGoals)
        }
    }

    function addTeleporter() {
        // Create a teleporter.
        // There is a maximum of 499 pairs of teleporters.
        // T001, T002 - T003, T004 - ... - T997, T998
        if (props.teleporters.length >= 499) return;
        let oldTeleporters = [...props.teleporters];
        oldTeleporters.push({
            from: [1, 1],
            to: [1, 1]
        });
        props.setsct(String(Number(oldTeleporters.length)));
        props.setTeleporters(oldTeleporters);
    }

    function addPath() {
        // Create a path.
        let oldPaths = [...gravitationData.paths];
        oldPaths.push([[0, 0], [0, Math.min(menuState.height-1, 8)]]);
        props.setscp(String(Number(oldPaths.length)));
        let newPaths = {custom: gravitationData.custom, paths: oldPaths};
        setGravitationData(newPaths);
        props.setgd(newPaths);
        props.setscpp(1);
    }

    function addVault() {
        // Create a vault.
        let oldVaults = [...props.vaults];
        oldVaults.push({
            from: [0, 0],
            to: [menuState.width-1, menuState.height-1],
            type: "Striped Circle",
            type2: "Nothing",
            translucent: false,
            colour: "Red",
            health: 5
        });
        props.setscv(String(Number(oldVaults.length)));
        props.setVaults(oldVaults);
    }

    function removePath(i) {
        // Remove the path.
        let oldPaths = [...gravitationData.paths];
        oldPaths.splice(i, 1);
        let newPaths = {custom: gravitationData.custom, paths: oldPaths};
        setGravitationData(newPaths)
        props.setgd(newPaths);
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

    function removeGoal(i, moon) {
        if (props.nightMode) {
            // Remove the goal.
            let oldGoals = [...props.mg];
            oldGoals[moon].splice(i, 1);
            props.smg(oldGoals)
        } else {
            // Remove the goal.
            let oldGoals = [...goals];
            oldGoals.splice(i, 1);
            setGoals(oldGoals);
            props.sg(oldGoals);
        }
    }

    function removeTeleporter(i) {
        // Remove the teleporters.
        let oldTeleporters = [...props.teleporters];
        oldTeleporters.splice(i, 1);
        props.setTeleporters(oldTeleporters);
    }

    function removeVault(i) {
        // Remove the vault.
        let oldVaults = [...props.vaults];
        oldVaults.splice(i, 1);
        props.setVaults(oldVaults);
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
        if (attrib === "type") {
            g[n].optional = levelThings.optionalGoalNumber.includes(to.toLowerCase());
            g[n].option = false;
            if (props.nightMode || levelThings.noGoalNumber.includes(to.toLowerCase())) g[n].amount = null;
            if (!g[n].amount && g[n].optional) g[n].amount = 3;
            else if (!levelThings.optionalGoalNumber.includes(to.toLowerCase()) && (!props.nightMode && !levelThings.noGoalNumber.includes(to.toLowerCase())) && !g[n].amount) g[n].amount = 3;
        }
        setGoals(g);
        props.sg(g);
    }

    function changeMoonGoalAttribute(moon, n, attrib, to, c) {
        let g = [...props.mg];
        if (c) g[moon][n][attrib] = !g[moon][n][attrib];
        g[moon][n][attrib] = typeof to !== "number" ? to : Number(to);
        if (attrib === "type") {
            g[moon][n].optional = levelThings.optionalGoalNumber.includes(to.toLowerCase());
            g[moon][n].option = false;
            if (!g[moon][n].amount && g[moon][n].optional) g[moon][n].amount = 3;
            else if (!levelThings.optionalGoalNumber.includes(to.toLowerCase()) && !g[moon][n].amount) g[moon][n].amount = 3;
        }
        props.smg(g);
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
        switch (t.toLowerCase()) {
            case "score": return "#ff9999";
            case "button": return "#99ddff";
            case "globe": return "#99ffcc";
            case "paint": return "#f3e830";
            case "ice": return "#cffff5";
            default: return "#ff77ff"; // order
        }
    }

    function makeTeleporters() {
        let items = [];
        // Make an Add button.
        items.push(<button id="MenuGoalAdd" onClick={addTeleporter} key={0}>
            Add Teleporters
        </button>)
        items.push(<button id="MenuGoalAdd" onClick={() => {
            removeTeleporter(props.sct - 1)
        }} key={1}>
            Delete Selected Teleporters
        </button>)

        items.push(<div>
            <label htmlFor="quantity" key={2} className={"MenuAreaLabel"}>Selected ID
                    <input type="number"
                        className={"MenuTele"} onChange={(e) => {
                            props.setsct(e.target.value);
                        }}
                        min={0} max={props.teleporters.length} step={1} value={props.sct} style={{
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

    function makeVaults() {
        let items = [];
        // Make an Add button.
        items.push(<button id="MenuGoalAdd" onClick={addVault} key={0}>
            Add Vault
        </button>)
        items.push(<button id="MenuGoalAdd" onClick={() => {
            removeVault(props.scv - 1)
        }} key={1}>
            Delete Selected Vault
        </button>)

        items.push(<div>
            <label htmlFor="quantity" key={2} className={"MenuAreaLabel"}>Selected ID
                    <input type="number"
                        className={"MenuTele"} onChange={(e) => {
                            props.setscv(e.target.value);
                        }}
                        min={0} max={props.vaults.length} step={1} value={props.scv} style={{
                            width: "80%"
                        }} />                               </label>
        </div>);

        let vaults = [];
        let options = [[],[],[
            <option key={"Nothing"} style={{
                backgroundColor: "rgb(50,100,50,100)"
            }}>Nothing</option>
        ]];

        for (let type in levelThings.vaultTypes) {
            const op = <option key={type} style={{
                backgroundColor: "rgb(0,50,0,100)"
            }}>{type}</option>
            options[0].push(op)
            options[2].push(op)
        }
        for (let colour in levelThings.vaultColours) {
            const val = levelThings.vaultColours[colour];
            const op = <option key={colour} style={{
                backgroundColor: val,
                color: (levelThings.lightVaultColours.includes(colour) ? "black" : null)
            }}>{colour}</option>
            options[1].push(op)
        }

        for (let i = 0; i < props.vaults.length; i++) {
            const vaultData = props.vaults[i];
            let vaultContent = [];
            vaultContent.push(makeSubSec("Vault #" + (i+1)));
            vaultContent.push(<label className="MenuAreaLabel" key={0}>Type
                <select
                    className="MenuAreaField" onChange={(e) => changeVaultAttribute(i, "type", e.target.value)}
                    value={vaultData.type} style={{
                        width: "55%"
                    }}>
                    {options[0]}
                </select>
            </label>)
            vaultContent.push(<label className="MenuAreaLabel" key={1}>Another?
                <select
                    className="MenuAreaField" onChange={(e) => changeVaultAttribute(i, "type2", e.target.value)}
                    value={vaultData.type2} style={{
                        width: "55%"
                    }}>
                    {options[2]}
                </select>
            </label>)
            vaultContent.push(<label className="MenuAreaLabel" key={10}>Colo(u)r
                <select
                    className="MenuAreaField" onChange={(e) => changeVaultAttribute(i, "colour", e.target.value)}
                    value={vaultData.colour} style={{
                        width: "55%"
                    }}>
                    {options[1]}
                </select>
                </label>
            )
            vaultContent.push(<div>
                <label htmlFor="input" className={"MenuAreaLabel"} key={30}>Translucent?<input type="checkbox"
                    className={"MenuAreaField"} onChange={(e) => changeVaultAttribute(i, "translucent", e.target.checked)}
                    checked={vaultData.translucent} style={{
                        width: "35%"
                    }} /></label>
            </div>)
            vaultContent.push(<label className="MenuAreaLabel" key={20}>Health
                <input type="number"
                    className={"MenuAreaField"} onChange={(e) => changeVaultAttribute(i, "health", e.target.value)}
                    min={1} max={Infinity} step={1} value={vaultData.health} style={{
                        width: "55%"
                    }} />
            </label>)
            //
            vaults.push(vaultContent);
        }

        items.push(vaults);
        items.push(makeInfo(
            `On this tab, perform these to:
            Left click: place a new vault at top left corner
            Right click: set bottom-right corner of vault`,
        false, true, true));

        return items;
    }

    function changeVaultAttribute(n, prop, to) {
        let g = [...props.vaults];
        if (!g[n]) return;
        g[n][prop] = to;
        props.setVaults(g);
    }

    function makeGoal(goal, i, moon) {
        const gt = levelThings.goals;
        let goalTypes = [];
        let goalItems = [];
        for (let j = 0; j < gt.length; j++)
        goalTypes.push(<option key={j} style={{
            backgroundColor: getC(gt[j]),
            color: "black"
        }}>{gt[j]}</option>)

        const isMoon = moon !== undefined;

        goalItems.push(<button className="MenuGoalRemove" onClick={() => removeGoal(i, moon)}>×</button>)
        goalItems.push(<label className="MenuAreaLabel">Type
            <select
                className="MenuAreaField" onChange={(e) => isMoon ? changeMoonGoalAttribute(moon, i, "type", e.target.value) : changeGoalAttribute(i, "type", e.target.value)}
                value={goal.type} style={{
                    width: "62%"
                }}>
                {goalTypes}
            </select>
        </label>
        )

        const scoreNight = goal.type === "Score" && props.nightMode;
        let tooltip = tooltips.goals[goal.type.toLowerCase()];
        if (scoreNight) {
            tooltip = tooltips.goals.night_score;
        }

        goalItems.push(<div style={{ fontSize: "12px", wordSpacing: "2px", lineHeight: 1 }}>{tooltip}</div>)
        if (goal.optional) goalItems.push(<div>
            <label htmlFor="input" className={"MenuAreaLabel"}>Specific?<input type="checkbox"
                className={"MenuAreaField"} onChange={(e) => isMoon ? changeMoonGoalAttribute(moon, i, "option", e.target.value, true) : changeGoalAttribute(i, "option", e.target.checked, true)}
                min={1} max={Infinity} step={1} checked={goal.option} style={{
                    width: "40%"
                }} /></label>
        </div>);

        if (goal.amount) goalItems.push(<div className="MenuWHField MenuAreaEDLabel">
            <label htmlFor="input">Anti?<input type="checkbox"
                className={"MenuWHFieldCheckbox"} onChange={(e) => isMoon ? changeMoonGoalAttribute(moon, i, "anti", e.target.checked, true) : changeGoalAttribute(i, "anti", e.target.checked, true)}
                min={1} max={Infinity} step={1} checked={goal.anti} style={{
                    width: "15%"
                }} /></label>
            <label htmlFor="quantity">Amount<input type="number"
                className={"MenuWHFieldNum"} onChange={(e) => isMoon ? changeMoonGoalAttribute(moon, i, "amount", e.target.value) : changeGoalAttribute(i, "amount", e.target.value)}
                min={1} max={Infinity} step={1} value={goal.amount} disabled={goal.optional && !goal.option} style={{
                    width: scoreNight ? "70%" : "25%"
                }} /></label>
        </div>);

        return (
            <div key={(isMoon ? (moon * 1000 + 1000) : 0) + i + 1} className="MenuGoal" style={{
                height: ((goal.optional ? 18 : (goal.amount ? 10 : 5)) + 7) + "%"
            }}>
                {goalItems}
            </div>
        );
    }

    function makeGoals() {
        const go = props.nightMode ? props.mg : goals;
        let items = [];
        if (!props.nightMode) {
            // Make an Add Goal button.
            items.push(<button id="MenuGoalAdd" onClick={addGoal} key={0}>
                Add Goal
            </button>)
            // Render the goals.
            for (let i = 0; i < go.length; i++) {
                let goal = go[i];
                items.push(makeGoal(goal, i));
            }
        } else {
            // Add goals for each of the moons.
            for (let m = 0; m < 3; m++) {
                items.push(
                    <div>
                        <strong style={{ color: levelThings.moonColours[m] }}>
                            {levelThings.moon}
                        </strong>
                        {makeSubSec(" Moon #" + (m+1))}
                    </div>
                )
                //
                items.push(<button id="MenuGoalAdd" onClick={ () => addGoal(m) } key={m}>
                    Add Goal
                </button>)
                //
                for (let i = 0; i < go[m].length; i++) {
                    let goal = go[m][i];
                    items.push(makeGoal(goal, i, m));
                }
            }
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
        setCannons(props.c);
        props.setmct(currentTab);
        setCameraData(props.cd);
        setSpawnData(props.spd);
        setGravitationData(props.gd);
        return () => { };
    }, [props.l, props.cd, props.spd, menuState, currentTab, props.m, props.g, props.teleporters, props.c, props.gd]);

    function saveLevel() {
        if (!props.isDefaultFilter()) {
            // Some filter is present. Give an alert.
            props.setAlertContent({
                title: "Cannot Save Level",
                content: "You cannot save a level with filters on.\nReset your filters first."
            })
            props.setAlertActive(true);
            return;
        }
        // Make basic metadata.
        let data = {
            night: props.nightMode ? true : undefined,
            moves: props.m.timed ? undefined : props.m.timemove,
            time: props.m.timed ? props.m.timemove : undefined,
            targets: props.nightMode ? undefined : [props.m.star1, props.m.star2, props.m.star3],
            maxBarScore: props.nightMode ? props.m.star1 : undefined,
            width: props.m.width === 9 ? undefined : props.m.width,
            height: props.m.height === 9 ? undefined : props.m.height,
            colours: props.m.colours,
            black: props.m.black,
            hard: props.nightMode ? undefined : Math.max(0, levelThings.hardTypes.indexOf(props.m.hard)),
            immediateShowdown: !props.nightMode && !props.m.immediateShowdown ? false : undefined,
            increaseColours: props.m.increaseColours ? true : undefined,
            seed: props.m.seedEnabled ? props.m.seed : undefined,
            moonGoals: props.nightMode ? [[], [], []] : undefined
        }
        // Goals!
        if (props.nightMode) {
            for (let i = 0; i < 3; i++) {
                let dataGoals = props.mg[i].map(o=>{
                    const obj = {
                        type: o.type.slice(-3) === "(L)" ? o.type.replace(/ /g, '_').toLowerCase().slice(0, -4) :
                                o.type.replace(/ /g, '_').toLowerCase(),
                        amount: (o.optional ? (o.option ? Number(o.amount) : null) : Number(o.amount) || null)
                    }
                    if (o.anti) obj.anti = true;
                    return obj;
                });
                data.moonGoals[i] = dataGoals;
            }
        } else {
            let goals = props.g
            let dataGoals = goals.map(o=>{
                const obj = {
                    type: o.type.slice(-3) === "(L)" ? o.type.replace(/ /g, '_').toLowerCase().slice(0, -4) :
                            o.type.replace(/ /g, '_').toLowerCase(),
                    amount: (o.optional ? (o.option ? Number(o.amount) : null) : Number(o.amount) || null)
                }
                if (o.anti) obj.anti = true;
                return obj;
            });
            data.goals = dataGoals;
        }
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
                for (let te in props.teleporters) {
                    let t = props.teleporters[te]
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
        // Gravitation!
        if (gravitationData.custom) {
            data.gravitationPaths = gravitationData.paths;
        }
        // Vaults!
        if (props.vaults.length > 0) {
            data.vaults = [];
            for (let vault of props.vaults) {
                let arr = [vault.from, vault.to,
                    vault.type.replace(/ /g, '_').toLowerCase(),
                    Object.keys(levelThings.vaultColours).indexOf(vault.colour) + (vault.translucent ? 50 : 0),
                    Number(vault.health)
                ];
                if (vault.type2 !== "Nothing") arr.push(vault.type2.replace(/ /g, '_').toLowerCase())
                data.vaults.push(arr);
            }
        }
        // Allow the user to save!
        window.API.fileSystem.saveLevel(props.l, props.dir[props.nightMode ? 1 : 0], data).then(() => {})
        let from = props.nightMode ? props.nlns : props.lns;
        if (!from.some(o => o[0] === props.l)) {
            if (props.nightMode) {
                props.snelns(props.nelns.concat([[props.l, data]]));
                props.snlns(props.nlns.concat([[props.l, data]]));
            } else {
                props.selns(props.elns.concat([[props.l, data]]));
                props.slns(props.lns.concat([[props.l, data]]));
            }
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

    function changeGravitationAttribute(key, value) {
        let d = structuredClone(gravitationData);
        d[key] = value;
        setGravitationData(d);
        props.setgd(d);
    }

    function makeGravitations() {
        let items = [];

        items.push(<div style={{height: "6%"}}>
        <label htmlFor="input" key={-1} className={"MenuAreaLabel"} style={{top: "50%",  marginTop: "3%"}}>Custom?<input type="checkbox"
            className={"MenuAreaField"} onChange={(e) => changeGravitationAttribute("custom", e.target.checked)}
            checked={gravitationData.custom} style={{
                width: "40%",
            }} /></label>
        </div>);

        let disabled = !gravitationData.custom;

        // Make an Add button.
        items.push(<button id="MenuGoalAdd" onClick={addPath} key={0} disabled={disabled}>
        Add Path
        </button>)
        items.push(<button id="MenuGoalAdd" onClick={() => {
            removePath(props.scp - 1)
        }} key={1} disabled={disabled}>
            Delete Selected Path
        </button>)

        items.push(<div>
            <label htmlFor="quantity" key={3} className={"MenuAreaLabel"}>Selected ID
                <input type="number" disabled={disabled}
                    className={"MenuTele"} onChange={(e) => {
                        props.setscp(e.target.value);
                    }}
                    min={0} max={gravitationData.paths.length} step={1} value={props.scp} style={{
                        width: "80%"
                    }} />                               
            </label>
        </div>);

        items.push(<div>
            <label htmlFor="quantity" key={4} className={"MenuAreaLabel"}>Selected Point #
                <input type="number" disabled={disabled}
                    className={"MenuTele"} onChange={(e) => {
                        props.setscpp(e.target.value);
                    }}
                    min={0} max={255} step={1} value={props.scpp} style={{
                        width: "80%"
                    }} />                               
            </label>
        </div>);

        return items;
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
        if (currentTab !== "teleporters") {
            props.setsct(0);
        }
        if (currentTab !== "vaults") {
            props.setscv(0);
        }
        switch (currentTab) {
            case "goals":
                return [makeSec("Goals"), makeGoals()];
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
                ];
            case "gravitation":
                return [
                    makeSec("Gravitation"),
                    makeGravitations(),
                    makeInfo(
                    `On this tab, for the selected path, perform these to:
                    Left click: place a new point
                    Right click: change the position of a selected point`  
                    , false, true)
                ];
            case "vaults":
                return [
                    makeSec("Vaults"),
                    makeVaults()
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

                    makeField(<><strong style={{ color: levelThings.starColours[0] }}>{levelThings.symbol(props.nightMode)} </strong>Target</>, "num", 
                        { min: 1, max: levelThings.maxScoreTarget, step: 1, value: 10000, width: 50, code: "star1" }
                    ),
                    makeField(<><strong style={{ color: levelThings.starColours[1] }}>{levelThings.symbol(props.nightMode)} </strong>Target</>, "num",
                        { min: 1, max: levelThings.maxScoreTarget, step: 1, value: 20000, width: 50, code: "star2" }
                    ),
                    makeField(<><strong style={{ color: levelThings.starColours[2] }}>{levelThings.symbol(props.nightMode)} </strong>Target</>, "num",
                        { min: 1, max: levelThings.maxScoreTarget, step: 1, value: 30000, width: 50, code: "star3"}
                    ),

                    makeField("Max Bar Score", "num", 
                        { min: 1, max: levelThings.maxScoreTarget, step: 1, value: 10000, width: 50, code: "star1", night: true }
                    ),

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
                <div>{(props.nightMode ? (levelThings.moon + " ") : "") + "Level " + props.l}</div>
                <div style={{fontSize:"16px"}}>{(props.nightMode ? ("Minimum Reached Level: " + Math.max(props.l * 5 + 1, 101)) : "")}</div>
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