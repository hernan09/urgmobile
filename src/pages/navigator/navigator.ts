import { DataService } from './../../providers/data.service';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';


@Component({
  selector: 'page-navigator',
  templateUrl: 'navigator.html',
})
export class NavigatorPage {

  public telefono;

  constructor(
    public navCtrl: NavController,
    private data :DataService) {
    
      //Busca en localstorage phone numbers
		  this.telefono = data.getPhoneNumber();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NavigatorPage');
  }

  nextPhoneNumber(){

    this.telefono = this.data.nextPhoneNumber();

  }

}
