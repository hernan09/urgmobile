import { HomePage } from './../home/home';
import { SociosPage } from './../socios/socios';
import { DataService } from './../../providers/data.service';
import { Component } from '@angular/core';
import { NavController ,ViewController} from 'ionic-angular';


@Component({
  selector: 'page-navigator',
  templateUrl: 'navigator.html',
})
export class NavigatorPage {

  public telefono;
  public arrowBack:boolean = false;

  constructor(
    public navCtrl: NavController,
    private data :DataService, private viewCtrl:ViewController) {
    
      //Busca en localstorage phone numbers
		  this.telefono = data.getPhoneNumber();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NavigatorPage');
  }

  nextPhoneNumber(){

    this.telefono = this.data.nextPhoneNumber();

  }

  public setArrowBack(value: boolean){
    this.arrowBack = value;

  }
  previusPage(){
    if(this.viewCtrl.component.name=="SociosPage"){
      this.navCtrl.setRoot(HomePage);
    }
    else{
      if (this.viewCtrl.component.name=="SolicitudVcPage"){
        this.navCtrl.setRoot(SociosPage);
      }
    }
    console.log();
    
  }
}
