import { ToastService } from './../../providers/toast.service';
import { Component, ChangeDetectorRef } from '@angular/core'
import { NavController, NavParams } from 'ionic-angular'

import { HomePage } from '../home/home'
import { LoginPage } from '../login/login'

import { DataService } from '../../providers/data.service'
import { Utils } from '../../providers/utils'
import { Config } from '../../app/config'
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
	selector: 'page-delete',
	templateUrl: 'delete.html',
})

export class DeletePage {
	profileForm = new FormGroup({
		partner: new FormControl('', Validators.required)
	  })
	users = []
	title = "Eliminar Socio"
	constructor(
		private ref: ChangeDetectorRef,
		public navCtrl: NavController,
		public navParams: NavParams,
		private dataService: DataService,
		public utils: Utils,
		private toastService: ToastService
	) {
		this.users = this.exludeTitular(dataService.getUsersData())

		dataService.usersChange.subscribe(users => {
			this.users = this.exludeTitular(users)
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

			if (user.dni == this.utils.getActiveUser()) {

				if (this.dataService.isTitular(user.dni)) {
					this.utils.setActiveUser(this.utils.getTitular())
					this.dataService.removeUsers(user.dni)
				} else {

					this.dataService.removeUsers(user.dni)
					this.utils.setActiveUser(null)
					this.utils.setItem(Config.KEY.EXPIRES, 0)
					this.navCtrl.setRoot(LoginPage)

				}
			}
			else {
				this.dataService.removeUsers(user.dni)
			}

		})



		this.toastService.showToast(selected.length + ' usuario(s) eleminado(s)', 2000)
		this.navCtrl.setRoot(HomePage)

	}

}
