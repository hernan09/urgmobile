import { DataService } from './../../providers/data.service';
import { HomePage } from './../home/home';
import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';


const RELOAD_DELAY = 3;

@Component({
  selector: 'page-videoconsulta-message',
  templateUrl: 'videoconsulta-message.html',
})
export class VideoconsultaMessagePage {

  
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private dataService : DataService, 
    private events: Events) {
    console.log("Redireccionar al home");
    this.dataService.setVCStatus(true);
    this.events.publish('vcStatus', true);
    setTimeout(_ => this.navCtrl.setRoot(HomePage), RELOAD_DELAY * 1000);
  }

}
