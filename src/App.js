import Levels from "./Levels.jsx";
import Palette from "./Palette.jsx";
import Menu from "./Menu.jsx";
import Board from "./Board.jsx";
import Tiles from "./Tiles.jsx";
import FilterDialog from "./FilterDialog.jsx";
import Alert from "./Alert.jsx";
import levelThings from "./levelThings.js";

import { useState, useRef } from "react";

function App() {
	const [level, setLevel] = useState(null);
	const [selected, setSelected] = useState(null);
	const [nightMode, setNightMode] = useState(false);

	let t = [];
    for (let i = 0; i < 9; i++) {
        let l = [];
        for (let j = 0; j < 12; j++) l.push(["**"]);
        t.push(l)
    }

	const [tiles, setTiles] = useState(t);
	const [g, setG] = useState([]);
	const [mg, setMG] = useState([[], [], []]);
	const [teles, setTeles] = useState([]);
	const [c, setC] = useState([]);
	const [ts, setTS] = useState(null);

	const [lns, setLNS] = useState([]);
	const [elns, setELNS] = useState([]);

	const [nlns, setNightLNS] = useState([]);
	const [nelns, setNightELNS] = useState([]);

	const [dir, setDir] = useState([null, null]);
	// Currently selected teleporter.
	const [sct, setsct] = useState(0);
	// Currently selected path (gravitation).
	const [scp, setscp] = useState(0);
	// Currently selected point of currently selected path (gravitation).
	const [scpp, setscpp] = useState(1);
	const [menuCurrentTab, setmct] = useState("properties");
	const [cameraData, setCameraData] = useState({
		enabled: false,
		cameras: [],
		requirements: [],
		showBackwards: true,
		width: 9,
		height: 9
	});
	const [spawnData, setSpawnData] = useState([]);
	const [menuS, setMs] = useState({
        timed: false,
        timemove: 30,
        colours: 4,
        width: 9,
        height: 9,
        hard: "Normal Level",
        star1: 10000,
        star2: 20000,
        star3: 30000,
		seed: 100,
		seedEnabled: false,
        increaseColours: false,
		black: false,
        immediateShowdown: true,
		preferredColours: { enabled: false, paths: [] }
    });
	const [gravitationData, setGravitationData] = useState({
		custom: false,
		paths: []
	})

	const [FGActive, setFGActive] = useState(false)
	const [alertActive, setAlertActive] = useState(false)
	const [alertContent, setAlertContent] = useState({
		title: "",
		content: ""
	})

	// Stores the default filtering options for levels.
	const defaultFilter = {
		hard: [true, true, true, true, true],

		moves: makeDefaultNumberFilter(1, 99),
		timed: makeDefaultCheckboxFilter(false),
		colours: makeDefaultNumberFilter(1, 6),
		width: makeDefaultNumberFilter(1, 99),
		height: makeDefaultNumberFilter(1, 99),
		black: makeDefaultCheckboxFilter(false),

		star1: makeDefaultNumberFilter(1, 1000000000),
		star2: makeDefaultNumberFilter(1, 1000000000),
		star3: makeDefaultNumberFilter(1, 1000000000),

		maxBarScore: makeDefaultNumberFilter(1, 1000000000),

		increaseColours: makeDefaultCheckboxFilter(false),
		immediateShowdown: makeDefaultCheckboxFilter(true),
	}

	const [filterAttributes, setFA] = useState({... defaultFilter})

	function makeDefaultNumberFilter(min, max) {
		return { enabled: false, min: min, max: max }
	}

	function makeDefaultCheckboxFilter(def) {
		return { enabled: false, checked: def }
	}

	function resetFilters() {
		setFA({ ...defaultFilter });
	}

	const inputLevels = useRef(null);

	function loadLevels() {
		let files;
		let numbers = [];
		if (inputLevels && inputLevels.current) {
			files = inputLevels.current.files;
			// Loop through every File found.
			let filtered = [];
			for (const o of files) {
				if (o.name.slice(-5) === ".json" && !isNaN(Number(o.name.slice(0, -5)))) {
					filtered.push(o);
				}
			}
			let len = filtered.length;
			let i = 0;

			for (const file of filtered) {
				const last = len - 1 === i;
				// Get levels that exist.
				const n = file.name;
				const reader = new FileReader();
				let stop = false;
				reader.onload = (e) => {
					const result = e.target.result;
					if (!result) return;
					// Parse the text as JSON.
					const data = JSON.parse(result);
					// Check if this levels meets the filter.
					if (!levelThings.meetsFilter(filterAttributes, data)) return;
					// nice!
					numbers.push([Number(n.slice(0, -5)), data]);
					if (last) setLevel(last + 1);
					if (nightMode && !data.night) {
						setAlertContent({
							title: "Alert",
							content: "It looks like you are trying to upload a folder containing normal levels as the night level folder. Therefore, the upload has been stopped to prevent errors."
						})
						setAlertActive(true);
						stop = true;
					} else if (!nightMode && data.night) {
						setAlertContent({
							title: "Alert",
							content: "It looks like you are trying to upload a folder containing night levels as the normal level folder. Therefore, the upload has been stopped to prevent errors."
						})
						setAlertActive(true);
						stop = true;
					}
				};
				if (stop) {
					return;
				}
				reader.readAsText(file);
				i++;
			}
			let sorted = numbers.sort((a,b)=>a[0]-b[0]);
			setELNS(sorted);
			setLNS(sorted);
		} else {
			for (const n of elns) {
				const last = elns.length - 1 === n[0];
				const data = n[1];
				// Check if this levels meets the filter.
				if (!levelThings.meetsFilter(filterAttributes, data)) continue;
				// nice!
				numbers.push([n[0], data]);
				if (last) setLevel(last + 1);
			}
			let sorted = numbers.sort((a,b)=>a[0]-b[0]);
			setLNS(sorted);
		}
	}

	return (
		<>
			<Palette ss={setSelected} cd={cameraData}/>
			<>
			<Menu  
				setmct={setmct} sct={sct} setsct={setsct}
				l={level} sm={setMs}
				dir={dir} m={menuS}
				g={g} sg={setG}
				mg={mg} smg={setMG}
				teles={teles} steles={setTeles}
				t={tiles} st={setTiles}
				elns={elns} selns={setELNS}
				lns={lns} slns={setLNS} sc={setC} c={c}
				nlns={nlns} snlns={setNightLNS}
				nelns={nelns} snelns={setNightELNS}
				nightMode={nightMode}
				cd={cameraData} setcd={setCameraData}
				spd={spawnData} setspd={setSpawnData}
				gd={gravitationData} setgd={setGravitationData}
				scp={scp} setscp={setscp} scpp={scpp} setscpp={setscpp}
			/>
			<div className={"BoardDiv"} style={{
				overflow: level > 0 ? "scroll" : "auto"
			}}>
			<Board 
				mct={menuCurrentTab}
				sct={sct} setsct={setsct}
				scp={scp}
				scpp={scpp} setscpp={setscpp}
				s={selected} m={menuS} l={level}
				st={setTiles} t={tiles} 
				teles={teles} steles={setTeles} 
				ts={ts} sts={setTS}
				cd={cameraData} setcd={setCameraData}
				gd={gravitationData} setgd={setGravitationData}
				/></div>
			</>
			<>
				<Levels
					l={level} sl={setLevel}
					dir={dir} st={setTiles} sd={setDir}
					sm={setMs} sg={setG} smg={setMG}
					steles={setTeles}

					slns={setLNS} lns={lns}
					elns={elns} selns={setELNS}

					snlns={setNightLNS} nlns={nlns}
					nelns={nelns} snelns={setNightELNS}

					sc={setC}
					cd={cameraData} setcd={setCameraData}
					setspd={setSpawnData} spd={spawnData}
					gd={gravitationData} setgd={setGravitationData}
					setFGActive={setFGActive} FGActive={FGActive}
					loadLevels={loadLevels}
					resetFilters={resetFilters}
					inputLevels={inputLevels}

					nightMode={nightMode} setNightMode={setNightMode}

					setAlertActive={setAlertActive} setAlertContent={setAlertContent}
				/>
				<Tiles
					ts={ts} t={tiles} st={setTiles}
					sts={setTS} ss={setSelected} 
					s={selected}
				/> 
			</>

			<FilterDialog
				active={FGActive} setFGActive={setFGActive}
				FA={filterAttributes} setFA={setFA}
				resetFilters={resetFilters}
				loadLevels={loadLevels}

				nightMode={nightMode}
			/>

			<Alert
				alertActive={alertActive} setAlertActive={setAlertActive}
				alertContent={alertContent}
			/>
		</>
	)
}

export default App;
