import { Injectable } from '@angular/core'
import { AlertController } from 'ionic-angular'






@Injectable()
export class AlertService {
    alert :any
    telefono:any;

    public constructor(public alertCtrl :AlertController){


    
    }

    public showAlert(title, subTitle, cssClass?,buttonText = "OK", handlerEvent? ) {
        this.alert = this.alertCtrl.create({
          title,
          subTitle,
          buttons: [{
              text:buttonText,
              handler:() => {
                  if(handlerEvent /*&& handlerEvent == "callNumber"*/){
                      handlerEvent();
                   // this.callNumber.callNumber("113943242", false)       
                  //  .then(res => console.log('Launched dialer!', res))
                    //.catch(err => console.log('Error launching dialer', err));
                  }
              }
          }],
          cssClass : cssClass,
        })    
        this.alert.present()
      }    
     
      public showOptionAlert(title,message, opcionOk, opcionCancel, cssClass?){
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
                        alert.dismiss(true);
                        return true;
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

