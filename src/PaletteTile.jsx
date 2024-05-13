import at from "./aliasTiles.js";
import { useState, useEffect } from "react";
import tiles from "./tiles.png";
import names from "./names.js";

function PaletteTile(props) {
    const [src, setSRC] = useState("");
    const [chosen, setChosen] = useState(false);

    function getDimensions(code) {
        const flatat = at.flat();
        let index = flatat.indexOf(code);
        if (index === -1) index = 8;
        let x = index % 8;
        let y = Math.floor(index / 8);
        return { x: x * 64, y: y * 64, w: 64, h: 64, i: index }
    }

    function isDisabled() {
        return props.code === "cp" && !props.cd.enabled;
    }

    function tooltip() {
        if (isDisabled()) {
            switch (props.code) {
                case "cp": return "Need to enable cameras to use this!"
            }
        }
        return names[props.code];
    }

    const code = props.code[0] == "S" ? "*S" : props.code;
    const d = getDimensions(code);

    useEffect(()=>{
        setChosen(props.sel === props.code);
    }, [props.sel])

    useEffect(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let image = new Image();
        image.src = tiles;
        ctx.drawImage(image, d.x, d.y, d.w, d.h, 0, 0, 32, 32);
        setSRC(canvas.toDataURL());

    }, [d.x, d.y, d.w, d.h, src])

    let customText = "";
    if (props.code[0] == "S") {
        // Add text.
        customText = props.code[1];
    }

    const disabled = isDisabled();
    return <button title={tooltip()} key={d.i} className={"PaletteButton" + (disabled ? " PaletteDisabled" : "")} onClick={()=>{props.setsel(props.code); props.setselapp(props.code); props.setrut(props.rut.concat(props.code))}} style={{
        outline: chosen ? "2px solid rgba(0,0,0,0.4)" : "0",
        borderRadius: chosen ? "2px" : "0",
    }} disabled={disabled}>
        {customText}
        <img src={src} alt={props.code}/>
    </button>
}

export default PaletteTile;