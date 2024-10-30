import { useEffect } from "react";
import levelThings from "./levelThings.js";

function FilterDialog(props) {

    function changeFilterAttribute(key, sub, to) {
        let newAttributes = { ...props.FA }
        switch (key) {
            case "hard":
                // to should be a boolean.
                newAttributes.hard[sub] = to;
                break;
            default:
                // to should be a number.
                newAttributes[key][sub] = to;
        }
        props.setFA(newAttributes);
    }

    function makeFilter(name, type, key, extra, htmlTitle) {
        let option;
        const extraExists = typeof extra === "object";

        switch (type) {
            case "hard":
                // Difficulty filter!
                option = [];
                for (let i = 0; i <= 4; i++) {
                    option.push(
                        <>
                            <input 
                                type="checkbox"
                                onChange={(e) => changeFilterAttribute("hard", i, e.target.checked)} 
                                checked={props.FA.hard[i]}
                                key={i}
                            />
                            <label>{levelThings.hardTypesNoLevel[i]}</label>
                        </>
                    )
                }
                break;
            case "number":
                // A number filter!
                option = [];
                // Add an enabling checkbox.
                option.push(
                    <>
                        <input 
                            type="checkbox"
                            onChange={(e) => changeFilterAttribute(key, "enabled", e.target.checked)} 
                            checked={props.FA[key].enabled}
                            key={"enabled"}
                        />
                        <label>Enabled?</label>
                    </>
                )
                // Add the maximum and minimum number inputs!
                let inputs = {
                    "min": "Minimum",
                    "max": "Maximum"
                };
                for (const input in inputs) {
                    let name = inputs[input];
                    const max = input === "max";
                    option.push(
                        <>
                            <label>{name}</label>
                            <input 
                                type="number"
                                onChange={(e) => changeFilterAttribute(key, input, e.target.value)} 
                                enabled={props.FA[key][input]}
                                min={extraExists ? (max ? props.FA[key].min : extra.min) : null}
                                max={extraExists ? (max ? extra.max : props.FA[key].max) : null}
                                step={extraExists ? extra.step : 1}
                                value={props.FA[key][input]}
                                disabled={!props.FA[key].enabled}
                                style={{
                                    marginRight: input !== "max" ? "80px" : 0
                                }}
                                key={input}
                            />
                        </>
                    )
                }
                break;
            case "checkbox":
                // A checkbox filter!
                // A number filter!
                option = [];
                // Add an enabling checkbox.
                option.push(
                    <>
                        <input 
                            type="checkbox"
                            onChange={(e) => changeFilterAttribute(key, "enabled", e.target.checked)} 
                            checked={props.FA[key].enabled}
                            key={"enabled"}
                        />
                        <label style={{marginRight: "200px"}}>Enabled?</label>
                    </>
                )
                // Add the actual checkbox.
                option.push(
                    <>
                        <input 
                            type="checkbox"
                            onChange={(e) => changeFilterAttribute(key, "checked", e.target.checked)} 
                            checked={props.FA[key].checked}
                            key={"prop"}
                            disabled={!props.FA[key].enabled}
                        />
                        <label style={{marginRight: "200px"}}>Checked?</label>
                    </>
                )
                break;
            default:
                console.warn("Unknown filter type '" + type + "'! Skipping.");
                return <></>;
        }

        if (key === "moves") {
            if (!props.FA.timed.enabled) name = "Moves / Time (seconds)";
            else if (props.FA.timed.checked) name = "Time (seconds)";
            else name = "Moves";
        }

        return (
            <div className="FilterDialogFilter" style={{textAlign: "left", marginBottom: "30px"}}>
                {htmlTitle ? name : <b>{name}</b>}
                <div className="FilterDialogOptions">
                    {option}
                </div>
            </div>
        )
    }

    function makeSep() {
        return <hr className="FilterSep"></hr>
    }

    function makeFilters() {
        let filters = [makeSep()];
        // Difficulty
        if (!props.nightMode) {
            filters.push(makeFilter("Difficulty", "hard", "hard"));
            filters.push(makeSep());
        }

        // Some Level Settings 
        filters.push(
            makeFilter("Moves", "number", "moves", { min: 1,  max: 99 })
        );
        filters.push(
            makeFilter("Timed?", "checkbox", "timed")
        );
        filters.push(
            makeFilter("Colo(u)rs", "number", "colours", { min: 1, max: 6 })
        );
        filters.push(
            makeFilter("Include Black Circles", "checkbox", "black")
        );
        filters.push(
            makeFilter("Width", "number", "width", { min: 1, max: 99 })
        );
        filters.push(
            makeFilter("Height", "number", "height", { min: 1, max: 99 })
        );

        filters.push(makeSep());

        filters.push(
            makeFilter("Increase colours?", "checkbox", "increaseColours")
        );
        if (!props.nightMode) filters.push(
            makeFilter("Immediate showdown?", "checkbox", "immediateShowdown")
        );

        // Score Targets
        if (!props.nightMode)
            for (let i = 1; i <= 3; i++) {
            filters.push(
                makeFilter(
                    <>
                        <b style={{ color: levelThings.starColours[i-1] }} >{levelThings.symbol(props.nightMode)} </b>
                        <b>Target</b></>
                , "number", "star" + i, { min: 1, max: levelThings.maxScoreTarget }, true)
            );
        } else {
            filters.push(
                makeFilter("Max Bar Score", "number", "maxBarScore", { min: 1, max: levelThings.maxScoreTarget })
            );
        }

        filters.push(makeSep());

        filters.push(
            makeFilter("Uses camera?", "checkbox", "hasCamera")
        );
        filters.push(
            makeFilter("Has custom gravitation?", "checkbox", "hasCustomGravitation")
        );
        filters.push(
            makeFilter("Has vaults?", "checkbox", "hasVaults")
        );
        filters.push(
            makeFilter("Has preferred colo(u)rs?", "checkbox", "hasPreferredColours")
        );
        filters.push(
            makeFilter("Has custom spawn configurations?", "checkbox", "hasCustomSpawnConfigs")
        );

        return filters;
    }

    useEffect(() => {
        if (!props.active) {
            // Update the levels loaded.
            props.loadLevels();
        }
    }, [props.active])

    return (
        <div className="FilterDialogUnderlay" hidden={!props.active}>
            <div className="FilterDialog" style={{textAlign: "center"}}>
                <div>
                    <b id="FilterDialogTitle">Filtering Options</b>
                    <button className="MenuGoalRemove TilesRemove" id="FilterDialogClose" onClick={() => props.setFGActive(false)}>×</button>
                </div>
                <button className="TilesDeselect" onClick={props.resetFilters}>Reset Filters</button>
                {makeFilters()}
            </div>
        </div>
    );
}

export default FilterDialog;