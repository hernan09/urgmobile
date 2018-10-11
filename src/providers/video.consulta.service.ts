import { Utils } from './utils';
import { DataService } from './data.service';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import { Subject } from "rxjs/Subject";
import { Config } from './../app/config';


const {VC_SERVER_URL } = Config;
@Injectable()
export class VideoConsultaService {
    public constructor(private http : Http, private dataService: DataService){
        
    }   

public checkIfBlocked(cid?) : Observable<any>{

        let answerObs : Subject<any> = new Subject<any>();
        //Cambie la logica el cid siempre lo recibe por parametro no lo busca mas en el dataService
        let cidUrl;
        if(cid){
          cidUrl = cid;
        }
        else{
         cidUrl = this.dataService.restoreCID();
        }
        this.http.get(VC_SERVER_URL + '/cid/' + cidUrl).subscribe(
            data => {
              // if get succeeds, cid is blacklisted
              answerObs.next(true);
              console.log("video.consulta.service - VC finished");
            },
            err => {
                console.log("video.consulta.service - VC still open");
                answerObs.next(false);
            }            
          )

          return answerObs; 
}
}

