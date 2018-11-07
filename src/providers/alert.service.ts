import { Injectable } from '@angular/core'
import { AlertController } from 'ionic-angular'

import { Config } from '../app/config'




@Injectable()
export class AlertService {
    alert :any

    public constructor(public alertCtrl :AlertController){


    
    }

    public showAlert(title, subTitle, cssClass?,buttonText = Config.ALERT_OPTIONS.ACEPTAR, handlerEvent? ) {
        this.alert = this.alertCtrl.create({
          title,
          subTitle,
          buttons: [{
              text:buttonText,
              handler:() => {
                  if(handlerEvent){
                      handlerEvent();
                  }
              }
          }],
          cssClass : cssClass,
        })    
        this.alert.present()
      }    
     
      public showOptionAlert(title,message, opcionOk=Config.ALERT_OPTIONS.SI, opcionCancel=Config.ALERT_OPTIONS.NO, cssClass?,handlerEvent?){
        let alert = this.alertCtrl.create({
            title: title,
            message: message,
            enableBackdropDismiss:false,
            buttons: [
                {
                    text: opcionCancel,
                    handler: () => {
                        alert.dismiss(false);
                        return false;
                    }
                },
                {
                    text: opcionOk,
                    handler: () => {
                        if(!handlerEvent){
                            alert.dismiss(true);
                            return true;
                        }else{
                            handlerEvent();
                        }
                    }
                }
            ],
            cssClass : cssClass,
        });
    
        return alert;
    }
    
      public hideAlert() {
        if (this.alert) this.alert.dismiss().catch(e=>{})
      }
  
}

