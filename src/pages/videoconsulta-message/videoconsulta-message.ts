import { HomePage } from './../home/home';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


const RELOAD_DELAY = 3;

@Component({
  selector: 'page-videoconsulta-message',
  templateUrl: 'videoconsulta-message.html',
})
export class VideoconsultaMessagePage {

  
  constructor(public navCtrl: NavController, public navParams: NavParams) {

    console.log("Redireccionar al home");
    setTimeout(_ => this.navCtrl.setRoot(HomePage), RELOAD_DELAY * 1000);
  }

}
