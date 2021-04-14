import * as React from 'react'

export default function DevToolsButton() {
  const browserView = fin.desktop.System.currentWindow.getBrowserView()
    // browserView will not exist on the Notifications Center if running FSBL 5.4+ 
    //  if this sees that, then no need to bother with the rest - that way it works for 
    //  normal windows and skips over oddities like Notifications Center
    if (browserView == null) {
        return "";
    }
  const appWindow = browserView.webContents

  const [devtoolsOpen, setDevtoolsOpen] = React.useState(false)

  React.useEffect(() => {
    appWindow.addListener("devtools-opened", () => {
      console.log("devtools-opened")
      setDevtoolsOpen(true)
    })

    appWindow.addListener("devtools-closed", () => {
      console.log("devtools-closed")
      setDevtoolsOpen(false)
    })
    return () => {
      appWindow.removeListener("devtools-opened")
      appWindow.removeListener("devtools-closed")
    }
  }, [])

  React.useEffect(() => {
    // When the component first opens we want to know if the dev tools were opened previously,
    // if they were then re-open them. This will only account for manual closing using the button.
    // To accommodate for closing via the dev-console use the listeners above to set the state. Be aware listeners may fire when finsemble closes down.
    FSBL.Clients.WindowClient.getComponentState
      ({ field: 'devToolsOpen' }, (err, res) => {
        console.log(res)
        res === true && toggleDevTools()
      })
  }, [])

  function toggleDevTools() {


    let devToolsOpen = appWindow.isDevToolsOpened();
    console.log(`DevTools Is open ${devToolsOpen}`)
    if (devToolsOpen) {
      appWindow.closeDevTools()
      FSBL.Clients.WindowClient.setComponentState({ field: 'devToolsOpen', value: false }, console.log);
    } else {
      console.log("DevTools is opening")
      appWindow.openDevTools()
      FSBL.Clients.WindowClient.setComponentState({ field: 'devToolsOpen', value: true }, console.log);
    }


  }


  return <button id="devtools" onClick={toggleDevTools} style={{ color: `${devtoolsOpen ? "green" : "white"}` }}>DevTools</button>
}