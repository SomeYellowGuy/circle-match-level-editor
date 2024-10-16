
function Alert(props) {

    return (
        <div className="FilterDialogUnderlay" hidden={!props.alertActive}>
            <div className="Alert" style={{textAlign: "center"}}>
                <div>
                    <b id="FilterDialogTitle">{props.alertContent.title}</b>
                    <button className="MenuGoalRemove TilesRemove" id="FilterDialogClose" onClick={() => props.setAlertActive(false)}>×</button>
                </div>
                {props.alertContent.content}
            </div>
        </div>
    )
 }

export default Alert;