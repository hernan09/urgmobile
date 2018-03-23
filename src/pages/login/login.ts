import { Component } from '@angular/core'
import { NavController, NavParams, MenuController } from 'ionic-angular'

import { RegisterPage } from '../register/register'
import { HomePage } from '../home/home'

import { AuthService } from '../../providers/auth.service'
import { DataService } from '../../providers/data.service'
import { NotificationsService } from '../../providers/notifications.service'
import { Utils } from '../../providers/utils'

import { Config } from '../../app/config'


const ERROR_MSG = {
  500 : Config.MSG.LOGIN_ERROR_DNI,
  502 : Config.MSG.LOGIN_ERROR_BLOCKED,
}


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage {

  dni :number
  telefono
  newMember = false
  button_text = 'INGRESAR'
  placeholder = ''

  version = Config.OPTIONS.VERSION_NUMBER

  constructor (
    public navCtrl :NavController, 
    public navParams :NavParams, 
    public authService :AuthService,
    public dataService :DataService,
    public notiService :NotificationsService,
    public utils :Utils,
    private menu: MenuController
  ){
    this.telefono = this.dataService.getPhoneNumber()
    this.newMember = this.navParams.get('newMember')

    if (authService.isAuthenticated() && !this.newMember) this.getDeviceID()

    this.placeholder = this.newMember ? 'DNI DEL SOCIO A AGREGAR' : 'TU DNI'
  }


  ionViewDidEnter() {
    this.menu.swipeEnable(false)
  }


  ionViewWillLeave() {
    this.menu.swipeEnable(true)
  }


  getDeviceID(dni?) {
    dni = dni || this.utils.getActiveUser()
    if (!dni) return
    console.log('Getting device ID...')
    this.utils.showLoader()
    try {
      this.notiService.init(this.navCtrl)
        .then(data => {
          const deviceId = data.userId // oneSignalPlayerID
          console.log(`Device ID is [${deviceId}]`)
          this.login(dni, deviceId)
        })
        .catch(err => {
          console.warn('Could not get device ID:', err)
          this.login(dni, null)
        })
    }
    catch(err) {
      console.warn('Cordova not available.')
      this.login(dni, null)
    }
  }


  login(dni, deviceId) {
    if (this.authService.isNewUser(dni)) {
      const newMember = this.newMember
      this.authService.checkDNI({ dni, deviceId }).subscribe(
        data => {
          this.utils.hideLoader()
          this.navCtrl.setRoot(RegisterPage, { data, dni, newMember }, {animate: true, direction: 'back'})
        },
        error => {
          this.utils.hideLoader()
          this.utils.showAlert(Config.MSG.SORRY, ERROR_MSG[ error.status ] || Config.MSG.CONNECTION_ERROR)
        }
      )
    }
    else {
      this.utils.hideLoader()
      if (this.newMember) return this.utils.showAlert(Config.MSG.SORRY, Config.MSG.ADD_USER_ERROR)
      this.authService.login(dni)
      this.navCtrl.setRoot(HomePage)
    }
  }


  nextPhoneNumber() {
    this.telefono = this.dataService.nextPhoneNumber()
  }

}
