import Levels from "./Levels.jsx";
import Palette from "./Palette.jsx";
import Menu from "./Menu.jsx";
import Board from "./Board.jsx";
import Tiles from "./Tiles.jsx";

import { useState } from "react";

function App() {
	const [level, setLevel] = useState(null);
	const [selected, setSelected] = useState(null);

	let t = [];
    for (let i = 0; i < 9; i++) {
        let l = [];
        for (let j = 0; j < 12; j++) l.push(["**"]);
        t.push(l)
    }
	const [tiles, setTiles] = useState(t);
	const [g, setG] = useState([]);
	const [teles, setTeles] = useState([]);
	const [c, setC] = useState([]);
	const [ts, setTS] = useState(null);
	const [lns, setLNS] = useState([]);
	const [dir, setDir] = useState(null);
	const [sct, setsct] = useState(0);
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
        increaseColours: false,
		black: false,
        immediateShowdown: true,
		preferredColours: { enabled: false }
    });

	return (
		<>
			<Palette ss={setSelected} cd={cameraData}/>
			<>
			<Menu  
				setmct={setmct} sct={sct} setsct={setsct}
				l={level} sm={setMs}
				dir={dir} m={menuS}
				g={g} sg={setG}
				teles={teles} steles={setTeles}
				t={tiles} st={setTiles}
				lns={lns} slns={setLNS} sc={setC} c={c}
				cd={cameraData} setcd={setCameraData}
				spd={spawnData} setspd={setSpawnData}
			/>
			<div className={"BoardDiv"} style={{
				overflow: level > 0 ? "scroll" : "auto"
			}}>
			<Board 
				mct={menuCurrentTab}
				sct={sct} setsct={setsct}
				s={selected} m={menuS} l={level}
				st={setTiles} t={tiles} 
				teles={teles} steles={setTeles} 
				ts={ts} sts={setTS}
				cd={cameraData} setcd={setCameraData}
				/></div>
			</>
			<>
				<Levels
					l={level} sl={setLevel}
					dir={dir} st={setTiles} sd={setDir}
					sm={setMs} sg={setG}
					steles={setTeles}
					slns={setLNS} lns={lns}
					sc={setC}
					cd={cameraData} setcd={setCameraData}
					setspd={setSpawnData} spd={spawnData}
				/>
				<Tiles
					ts={ts} t={tiles} st={setTiles}
					sts={setTS} ss={setSelected} 
					s={selected}
				/> 
			</>
		</>
	)
}

export default App;
