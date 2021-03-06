// interface EmptyArray {
// }

export default class apiClient {

    _uhs = ''
    _userToken = ''

    constructor(uhs: string, userToken: string){
        this._uhs = uhs
        this._userToken = userToken
    }

    get(url: string, authentication = true) {
        return new Promise((resolve, reject) => {
            const authHeaders:any = {}

            if(authentication === true){
                authHeaders['Authorization'] = 'XBL3.0 x='+this._uhs+';'+this._userToken
            }

            fetch(url, {
                method: 'GET', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                // credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    ...authHeaders,
                    'Accept-Language': 'en-US',
                    'x-xbl-contract-version': '3',
                    'x-xbl-client-name': 'XboxApp',
                    'x-xbl-client-type': 'UWA',
                    'x-xbl-client-version': '39.39.22001.0'
                // 'Content-Type': 'application/x-www-form-urlencoded',
                }
            }).then((response) => {
                if(response.status !== 200){
                    console.log('Error fetching consoles. Status:', response.status, 'Body:', response.body)
                } else {
                    response.json().then((data) => {
                        resolve(data)
                    }).catch((error) => {
                        reject(error)
                    })
                }
            }).catch((error) => {
                reject(error)
            });
        })
    }

    getProfile() {
        return this.get('https://profile.xboxlive.com/users/me/profile/settings?settings=GameDisplayName,GameDisplayPicRaw,Gamerscore,Gamertag')
    }

    getFriends() {
        return this.get('https://peoplehub.xboxlive.com/users/me/people/social/decoration/preferredcolor,detail,multiplayersummary,presencedetail')
    }

    getProducts(inputId:any) {
        let ids
        if(inputId instanceof Array){
            // We got an array with id's, lets merge them
            ids = inputId.join(',')
        } else {
            ids = inputId
        }

        return this.get('https://displaycatalog.mp.microsoft.com/v7.0/products?actionFilter=Browse&bigIds='+ids+'&fieldsTemplate=browse&languages=en-us&market=us', false)
    }
}