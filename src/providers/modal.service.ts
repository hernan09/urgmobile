import { Injectable } from '@angular/core'
import { NavController } from 'ionic-angular';

@Injectable()
export class ModalService {

    public constructor(){
    }    

    closeAllOverlays(navCtrl : NavController){
        if(navCtrl.getActive().instance.closeAllOverlays)
            navCtrl.getActive().instance.closeAllOverlays();
    }
}

