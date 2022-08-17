// //import global from '../../../typings/custom'
  
// export class AjaxManager { 

//     public baseDir: string | null

//     private method: string
//     private headers: { 
//         'Accept': string
//         'Content-Type': string
//         'Access-Control-Allow-Origin': string
//     }

//     constructor (baseDir: string | null) { this.baseDir = baseDir !== null ? baseDir : '/'; }

//     public async xhr(path: string, method: string, body: any)
//     {

//         const req: any = await this.request(method, body);

//         const request = {
//             method: req.method,
//             headers: req.headers,
//             body: typeof window['_xhr'] !== 'undefined' ? req.body : JSON.stringify(req.body)     
//         };
//         return typeof window['_xhr'] !== 'undefined' ?
//             window['_xhr'](path, request) : fetch(path, request); 
//     }

//     //------------------- format


//     private async request(method: string, body: any)
//     {
//         this.headers = { 
//             'Accept': 'application/json', 
//             'Content-Type': 'application/json',
//             //mode:  'cors', //*cors, same-origin
//             //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//            // credentials: 'include', //GET ONLY
//             'Access-Control-Allow-Origin': '*' //'*'
//         };
//         switch (method)
//         {
//             case 'GET': 
//                 this.method = 'GET'; break; 
//             case 'POST': 
//                 this.method = 'POST'; break;
//             case 'PUT': 
//                 this.method = 'PUT'; break;
//         }

//         const req = {
//             method: this.method,
//             headers: this.headers
//         }
//         method === 'POST' || method === 'PUT' ? 
//             req['body'] = body : delete req['body'];

//         return req;
//     }  
    
// } 


  
export class AjaxManager { 

    constructor () 
    { 
        let connectString = System.proxyConnection;
        this.baseDir = connectString !== null ? connectString : '/'; 
    }

    async xhr(_path, method, body)
    {

        const req = await this.request(method, body);

        const request = {
            method: req.method,
            headers: req.headers,
            body: typeof window._xhr === 'function' ? req.body : JSON.stringify(req.body)     
        };
        return typeof window._xhr === 'function' ?
            window._xhr(_path, request) : fetch(_path, request);
    }

    //------------------- format


    async request(type, body)
    {
        this.headers = { 
            'Accept': 'application/json', 
            'Content-Type': 'application/json',
            //mode:  'cors', //*cors, same-origin
            //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
           // credentials: 'include', //GET ONLY
            'Access-Control-Allow-Origin': '*' //'*'
        };
        switch (type)
        {
            case 'GET': this.method = 'GET'; break;
            case 'POST': this.method = 'POST';
            break;
            case 'PUT': this.method = 'PUT'; break;
        }
        const req = {
            method: this.method,
            headers: this.headers
        }
        type === 'POST' || type === 'PUT' ? 
            req['body'] = body : delete req['body'];

        return req;
    }  
    
} 




