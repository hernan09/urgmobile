import { ChangeDetectorRef } from '@angular/core';
import { NavigatorPage } from './../navigator/navigator';
import { Observable } from 'rxjs';
import { AlertService } from '../../providers/alert.service';
import { Config } from './../../app/config';
import { NetworkService } from './../../providers/network.service';
import { Component } from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';
import { SolicitudVcPage } from '../solicitud-vc/solicitud-vc';
import { SaContactoPage } from '../sa-contacto/sa-contacto';
import { DataService } from '../../providers/data.service';
import { HomePage } from '../home/home';
import { Utils } from '../../providers/utils';
import { ToastService } from '../../providers/toast.service';
import { ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

/**
 * Generated class for the SolicitudAtencionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-solicitud-atencion',
  templateUrl: 'solicitud-atencion.html',
})

export class SolicitudAtencionPage {
    data:any;

    profileForm = new FormGroup({
      partner: new FormControl('', Validators.required)
    })

    constructor(public navCtrl: NavController){
      this.data = ["Incarbone Eduardo Oscar","Incarbone Maria Sol" ]
    }

    getDataPartner() {
      this.gotoPage();

    }

    gotoPage(){
      this.navCtrl.push( SaContactoPage );
    }

}
