import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DataService } from './../../providers/data.service';

@Component({
  selector: 'page-footer',
  templateUrl: 'footer.html',
})
export class FooterPage {

  public telefono;
  
  constructor(public navCtrl: NavController, private data :DataService) {
  }

  nextPhoneNumber(){
    this.telefono = this.data.nextPhoneNumber();
  }

}
