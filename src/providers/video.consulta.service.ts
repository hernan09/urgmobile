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

    public checkIfBlocked(dni) : Observable<any>{

        let answerObs : Subject<any> = new Subject<any>();
        let cid = this.dataService.getCID(dni);
        

          this.http.get(VC_SERVER_URL + '/cid/' + cid).subscribe(
            data => {
              // if get succeeds, cid is blacklisted
              answerObs.next(true);
              console.log("Se termino la videoConsulta");
            },
            err => {
                console.log("Sigue en pie la videoconsulta");
                answerObs.next(false);
            }            
          )

          return answerObs; 
}

public checkIfBlocked2(dni) : Observable<any>{

  let answerObs2 : Subject<any> = new Subject<any>();
  let cid = this.dataService.getCID(dni);
  

    this.http.get(VC_SERVER_URL + '/cid/' + cid).subscribe(
      data => {
        // if get succeeds, cid is blacklisted
        answerObs2.next(true);
        console.log("Se termino la videoConsulta");
      },
      err => {
          console.log("Sigue en pie la videoconsulta");
          answerObs2.next(false);
      }            
    )

    return answerObs2; 
}
}

