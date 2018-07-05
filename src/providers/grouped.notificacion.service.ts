import { AlertBuilder } from './builders/alert.builder';
import { Injectable } from "@angular/core";
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { Subject } from "rxjs/Subject";
import {Observable} from 'rxjs/Observable';

@Injectable()
export class GroupedNotificationService {
      
    constructor(private alertBuilder : AlertBuilder
      ) {}
 
   
    public addGroupedNotifications(groupedNotifications) : Observable<any>{

        let alertaObs : Subject<any> = new Subject<any>(); 
        console.log("Entra a addGroupedNotifications: ", groupedNotifications);
        let alertasArray = [];
        let count=0;

        this.alertBuilder.getAlertaObservable().subscribe( data => {
            console.log("Recibo el alerta: ", data, "trato de insertar en index: ", data.order);
            alertasArray[data.order] = data;
            count++;
            if(groupedNotifications.length == count) {
                alertaObs.next(alertasArray);               
            }    
            console.log("Notification order data: ", data);
          }
        )

        for (let index = 0; index < groupedNotifications.length ; index++) {
          const newNoti = groupedNotifications[index];
          
          const noti = {
            title: newNoti.body,
            data: newNoti.additionalData,
            androidNotificationId: newNoti.notificationID,
            order:index
          };  
          this.alertBuilder.createNewAlerta(noti);        
        }
        return alertaObs;
     
      }

}
