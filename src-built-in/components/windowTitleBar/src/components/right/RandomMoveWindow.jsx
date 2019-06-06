import React, { useState } from 'react'

const randomMove = async (docked) => {
  if (docked) {
    try {
      const windowIdentifier = await FSBL.Clients.LauncherClient.getMyWindowIdentifier()

      console.log(windowIdentifier)
      // uncomment the line below and it will work
      const { data: { monitorRect } } = await FSBL.Clients.LauncherClient.getMonitorInfo(windowIdentifier)
      // also comment out the one below this
      // const { data: { monitorRect } } = await FSBL.Clients.LauncherClient.getMonitorInfo()

      const { height, width } = monitorRect

      const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));
      const top = getRandomInt(height) || "300px"
      const right = getRandomInt(width) || "300px"

      FSBL.Clients.LauncherClient.showWindow(windowIdentifier, { top, right })

    } catch (error) {
      console.log(error)
      throw (error)
    }
  }
}
const RandomMoveWindow = ({ docked }) => {
  return (
    <div className="random-move-window__button">
      <span onClick={() => randomMove(docked)} >🎉</span>
    </div>
  )
}

export default RandomMoveWindow
