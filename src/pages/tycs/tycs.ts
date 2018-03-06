import { Component } from '@angular/core'
import { NavController, NavParams, MenuController } from 'ionic-angular'

@Component({
  selector: 'page-tycs',
  templateUrl: 'tycs.html',
})

export class TycsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private menu: MenuController) {
  }

  ionViewDidEnter() {
    this.menu.swipeEnable(false)
  }

  ionViewWillLeave() {
    this.menu.swipeEnable(true)
  }

}
