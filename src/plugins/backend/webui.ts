import appMenu from '../../backend/appMenu'
import express from 'express'
import xCloudClient from '../../frontend/xcloudclient'
import TokenStore from '../../backend/TokenStore';
import Application from '../../frontend/application';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

interface OpentrackPosition {
    [key: string]: number;
}

export class WebuiPluginBackend {

    _isRunning = false
    _menu:appMenu
    _tokenStore:TokenStore

    _server:any
    _serverStatus = {
        port: -1
    }

    _syncInterval:any
    _xCloudClient:any

    constructor(menu:appMenu, tokenStore:TokenStore = undefined) {
        this._menu = menu
        this._tokenStore = tokenStore
    }

    load() {
        // this._menu._ipc.on('opentrack-sync', (event:any, variables:any) => {
        //     // console.log('IPCMain received:', variables)

        //     // Backend is always in the lead of settings.
        //     event.reply('opentrack-sync', {
        //         isRunning: this._isRunning,
        //         position: this._position
        //     })
        // })

        // this._menu._ipc.on('opentrack-position', (event:any, variables:any) => {
        //     event.reply('opentrack-position', {
        //         position: this._position
        //     })
        // })
    }

    start() {
        this._isRunning = true

        this.startServer()
        this._menu.setMenu('webui', this.getMenu())
    }

    stop() {
        this._isRunning = false

        this.stopServer()
        this._menu.setMenu('webui', this.getMenu())
    }

    startServer(port = 8080) {
        console.log('Starting WebUI Webserver...', MAIN_WINDOW_WEBPACK_ENTRY)

        this._server = express()
        this._xCloudClient = new xCloudClient({ _tokenStore: this._tokenStore } as Application, 'uks.gssv-play-prodxhome.xboxlive.com', this._tokenStore._streamingToken, 'home')

        this._server.get('/', (req:any, res:any) => {
            console.log('GET /')
            res.send('Hello World!')
        })

        this._server.get('/api/consoles', (req:any, res:any) => {
            console.log('GET /api/consoles')

            this._xCloudClient.getConsoles().then((consoles:any) => {
                console.log('consoles', consoles)
                res.send(consoles)

            }).catch((error:any) => {
                console.log('consoles error', error)
                res.send(error)
            })
            
        })

        this._serverStatus.port = port
        this._server.listen(port, () => {
            console.log(`WebUI listening at http://localhost:${port}`)
        })
    }

    stopServer() {
        console.log('Stopping WebUI Webserver...')
        clearInterval(this._syncInterval)
        this._serverStatus.port = -1

        this._server.stop()
        this._xCloudClient = undefined

        // this._server.close();
        console.log('WebUI Webserver stopped.')
    }

    getMenu() {
        return {
            label: 'WebUI',
            submenu: [
                {
                    label: (this._isRunning === true) ? 'Stop Webserver' : 'Start Webserver',
                    click: async () => {
                        if(this._isRunning === false){
                            this.start()
                        } else {
                            this.stop()
                        }
                    }
                },
                {
                    label: this.getStatusLabel(),
                    enabled: false,
                },
                { type: 'separator' },
                ...this.getPositionsMenu(),
            ]
        }
    }

    getPositionsMenu():any {
        const menu:Array<any> = [
            {
                label: 'Open electron build',
                enabled: this._isRunning,
                click: async () => {
                    const { shell } = require('electron')
                    await shell.openExternal(MAIN_WINDOW_WEBPACK_ENTRY)
                }
            },
            {
                label: 'Open WebUI Stream',
                enabled: this._isRunning,
                click: async () => {
                    const { shell } = require('electron')
                    await shell.openExternal(MAIN_WINDOW_WEBPACK_ENTRY+'/../stream_ui/')
                }
            },
            {
                label: 'Open WebUI in browser',
                enabled: this._isRunning,
                click: async () => {
                    const { shell } = require('electron')
                    await shell.openExternal('http://localhost:'+this._serverStatus.port)
                }
            }
        ]

        return menu
    }

    getStatusLabel(){
        if(this._isRunning === true){
            return 'Status: Running on port '+this._serverStatus.port
        } else {
            return 'Status: Not running'
        }
    }
}