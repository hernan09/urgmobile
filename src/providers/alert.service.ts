import { Injectable } from '@angular/core'
import { AlertController } from 'ionic-angular'


@Injectable()
export class AlertService {

    alert :any

    public constructor(public alertCtrl :AlertController){
    }

    public showAlert(title, subTitle) {
        this.alert = this.alertCtrl.create({
          title,
          subTitle,
          buttons: ['OK']
        })
    
        this.alert.present()
      }    
     
      public showOptionAlert(title,message, opcionOk, opcionCancel){
        let alert = this.alertCtrl.create({
            title: title,
            message: message,
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
            ]
        });
    
        return alert;
    }
    
      public hideAlert() {
        if (this.alert) this.alert.dismiss().catch(e=>{})
      }
  
}

