import { Injectable } from '@angular/core'
import { Http, Headers, RequestOptions } from '@angular/http'
import { Observable } from 'rxjs'
import 'rxjs/Rx'
import 'rxjs/add/operator/map'

import { Config } from '../app/config'

const headers = new Headers({ 'Content-Type': 'application/json' })
const authHeaders = new Headers({
    'Authorization': 'Bearer',
    'Content-Type': 'application/x-www-form-urlencoded'
})

@Injectable()
export class ImageService {    

    public constructor(public http: Http){
    }

    public downloadImage(url): Observable<any> {
        let options = new RequestOptions({ headers: headers });

        return this.http.get(url,options)            
            .map(this.handleImage.bind(this))
            .catch(err => {               
                this.error('error imagen', err)
                return null;
            })
    }
    

    handleImage(res) {
        let data = res.url;
        console.log('downloadImage Response:', data);        
        return data;

    }

    error(prop, err) {
        console.error('Could not get [' + prop + ']: ' + (err || 'Server error'))
    }

    
}

