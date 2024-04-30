/* eslint no-useless-escape:0 */
function UnsupportedBrowserPage() {

    return (
        <div className="oops">
            <div className="oopsmessage">
                <h1>Oops! You are not using Circle Match Level Editor in an Electron app!</h1>
                <h1 className="oopsrecommendation">Try using the Electron build of this app.</h1>
            </div>
        </div>
    )
}

export default UnsupportedBrowserPage;