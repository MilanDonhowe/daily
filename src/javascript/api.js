/* 
    Filename: api.js
    Description: Frontend functions to call the MongoDB API
*/


// for future reference, extracting this to a config file would be wise.
const API = 'http://localhost' + ':' + 3000 + '/api'

export async function apiGET(route, parameter){
    
    const url = `${API}/${route}/${parameter}`

    const api_result = await fetch(url, {
        headers:{
            'Content-Type': 'application/json'
        }
    })
        .catch(err => {
            console.log(`
                Error with GET @ ${url}
                Message:
                    ${err}
            `)
        })

    return api_result
}


export async function apiPOST(route, payload){

    const url = `${API}/${route}`
    const api_result =  await fetch(url, {
        method: 'POST',
        mode: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).catch(err => {
        console.log(`
                Error with POST @ ${url}
                Message:
                    ${err}
        `)
    })

    return api_result
}