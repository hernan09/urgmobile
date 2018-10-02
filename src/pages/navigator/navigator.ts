import { HomePage } from './../home/home';
import { SociosPage } from './../socios/socios';
import { DataService } from './../../providers/data.service';
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController ,ViewController, Events} from 'ionic-angular';


@Component({
  selector: 'page-navigator',
  templateUrl: 'navigator.html',
})
export class NavigatorPage {

  public telefono;
  public arrowBack:boolean = false;
  isSurveyActive : boolean = false;

  constructor(
    public navCtrl: NavController,
    private data :DataService, private viewCtrl:ViewController, private events:Events, private ref : ChangeDetectorRef
  ) {
    
      //Busca en localstorage phone numbers
      this.telefono = data.getPhoneNumber();

      this.isSurveyActive = this.data.getSurveyStatus();

      events.subscribe('survey', (data) => {
        this.isSurveyActive = data;
        this.data.setSurveyStatus(data);
        this.ref.detectChanges();
      });
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
  
  public previusPage(){
    if(this.navCtrl.getActive().instance.previusPage)
        this.navCtrl.getActive().instance.previusPage();
}


  
}
