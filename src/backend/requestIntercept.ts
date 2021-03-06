import { BrowserWindow } from "electron"

export default function (details:any, callback:any):void {
    if (details.uploadData !== undefined && details.requestHeaders !== undefined && details.method === 'POST'){
      this.setMSALData(details.uploadData, details.requestHeaders)

      let windowId = 0
      if(process.env.ISDEV !== undefined){
          windowId = (details.webContentsId-1)
      } else {
          windowId = details.webContentsId
      }
      try {
        const window = BrowserWindow.fromId(windowId)
        window.close()
      } catch(error){
          console.log('Failed to close parent window in requestIntercept', details.webContentsId)
          console.log(error)
      }

      callback({cancel: true})
    } else {
      // details.requestHeaders['Origin'] = 'https://www.xbox.com'
      // callback({ requestHeaders: details.requestHeaders })
      callback({cancel: false})
    }
}
