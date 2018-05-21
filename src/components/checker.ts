import { Component } from '@angular/core'


@Component({
	selector : 'checker',
	template : `
	<div *ngIf="show == 'checking'" class="loaderContainer">
		<div class="circle-loader checking" [ngClass]="{'goRed': goRed}">
		</div>
	</div>

	<div *ngIf="show == 'ok'" class="loaderContainer">
		<div class="circle-loader" [ngClass]="{'load-complete': showCheck}">
			<div class="checkmark draw" [ngClass]="{'showCheck': showCheck}"></div>
		</div>
		<div *ngIf="msg" class="label-ok">{{ msg }}</div>
	</div>

	<div *ngIf="show == 'error'" class="loaderContainer">
			<ion-icon  id="error-icon" name="ios-close-circle-outline" color="danger"></ion-icon>
		<div *ngIf="msg" class="label-error">{{ msg }}</div>
	</div>
	`,
})
export class CheckerComponent {
	
	msg = ''
	show = ''
	showCheck = false

	constructor(){}

	public showOk(msg) {
		this.showCheck = false
		this.msg = msg
		this.show = 'ok'
		setTimeout(_ => this.showCheck = true, 1000)
	}

	public showError(msg) {
		this.showCheck = false
		this.msg = msg
		this.show = 'error'
		setTimeout(_ => this.showCheck = true, 1000)
	}

	public showChecking() {
		this.show = 'checking'
	}

	public hide() {
		this.show = ''
	}
}
