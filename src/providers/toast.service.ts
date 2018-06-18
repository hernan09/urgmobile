import { Injectable } from '@angular/core'
import { ToastController } from 'ionic-angular'
import { MinimizeService } from './minimize.service';

@Injectable()
export class ToastService {
    i = 0;
    toast :any

    public constructor(public toastCtrl :ToastController, private minimizeService : MinimizeService){
    }

    public showToast(message='Toast', duration?, position?) {        
        this.toast = this.toastCtrl.create({
          message,
          duration,
          position,
          showCloseButton : duration === 0,
          closeButtonText : 'Cerrar',
        })
        if(!this.minimizeService.isMinimized()){
          this.toast.present()
        }
        
    
      }
      public hideToast() {      
      
        if(!this.minimizeService.isMinimized()){
          if (this.toast) this.toast.dismiss().catch(e=>{})
        }          
        
      }

    
}

