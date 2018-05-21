import { Component, ChangeDetectorRef } from '@angular/core'
import { NavController, NavParams } from 'ionic-angular'

import { HomePage } from '../home/home'
import { LoginPage } from '../login/login'

import { DataService } from '../../providers/data.service'
import { Utils } from '../../providers/utils'
import { Config } from '../../app/config'

@Component({
  selector: 'page-delete',
  templateUrl: 'delete.html',
})

export class DeletePage {

	users = []

  	constructor(
  		private ref :ChangeDetectorRef,
  		public navCtrl :NavController,
  		public navParams :NavParams,
  		private dataService :DataService,
		public utils :Utils 
  	){
  		this.users = this.exludeTitular( dataService.getUsersData() )

		dataService.usersChange.subscribe(users => {
			this.users = this.exludeTitular( users )
			if (!this.ref['destroyed']) this.ref.detectChanges()
	    })
  	}

	ionViewDidLoad() {
	}

	exludeTitular(data) {
		return data.filter(e => e.dni !== this.utils.getTitular())
	}

	delete() {
		const selected = this.users.filter(e => e.delete)

		selected.forEach(user => {

			if(user.dni == this.utils.getActiveUser()){

				if(this.dataService.isTitular(user.dni)){
					this.utils.setActiveUser(this.utils.getTitular())
					this.dataService.removeUsers(user.dni)
				}else{
	
					if(this.utils.getGuestUsers().length > 1){

						this.dataService.removeUsers(user.dni)
						if(user.dni == this.utils.getVisitante()){
							this.utils.setVisitante(this.utils.getGuestUsers()[0])
						}
						this.utils.setActiveUser(this.utils.getGuestUsers()[0])
					}
					else{
						this.dataService.removeUsers(user.dni)
						this.utils.setActiveUser(null)
						this.utils.setItem(Config.KEY.EXPIRES, 0)
						this.navCtrl.setRoot(LoginPage)
					}
				}
			}
			else{
				this.dataService.removeUsers(user.dni)
			}

		})
		
		if(this.utils.getGuestUsers().length == 0){
			this.utils.setActiveUser(null)
			this.utils.setItem(Config.KEY.EXPIRES, 0)
			this.navCtrl.setRoot(LoginPage)
		}
		else{
			this.utils.showToast(selected.length + ' usuario(s) eleminado(s)', 2000)
			this.navCtrl.setRoot(HomePage)
		}
	}

}
