import { Config } from './../app/config';
import { Utils } from './utils';
import { DataService } from './data.service';
import { Injectable } from '@angular/core';



@Injectable()
export class LoginService {

    constructor(
        private utils: Utils,
        private dataService : DataService,
      ) {}


// UTILS
 public login(dni) {
    if (!dni) throw "Cannot login: missing dni!";

    const activeUser = this.utils.getActiveUser();

    if (!activeUser && this.isNewUser(dni) && this.utils.getTitular()) {
      //primero borro todo y despues agrego al usuario nuevo
      this.dataService.removeAllUsers();

      this.utils.setActiveUser(dni);
      this.dataService.addUser(dni, true); // true = noupdate
      this.utils.setTitular(dni);
    } else {
      if (activeUser) {
        //se agrega un nuevo socio
        if (this.dataService.isTitular(activeUser) && this.isNewUser(dni)) {
          this.dataService.addUser(dni, true); // true = noupdate
        }
        this.utils.setActiveUser(dni);
      } else {
        //caso primer ingreso
        this.utils.setActiveUser(dni);

        if (this.isNewUser(dni) && !this.utils.getTitular()) {
          this.dataService.addUser(dni, true); // true = noupdate
          this.utils.setTitular(dni);
        }
      }
    }

    this.utils.setItem(Config.KEY.EXPIRES, this.calcExpireTime());
  }

  public isNewUser(dni) {
    const users = this.dataService.restoreUsers();
    return users.indexOf(dni) === -1;
  }

  calcExpireTime() {
    return Date.now() + Config.OPTIONS.EXPIRE_TIME * 6000;
  }

}