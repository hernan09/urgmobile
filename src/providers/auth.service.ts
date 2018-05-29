import { Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";
import { Observable } from "rxjs";
import "rxjs/Rx";
import "rxjs/add/operator/map";

import { DataService } from "./data.service";
import { Utils } from "./utils";

import { Config } from "../app/config";

const { API, SERVER_URL, authBody } = Config;
const headers = new Headers({ "Content-Type": "application/json" });
const authHeaders = new Headers({
  Authorization: "Bearer",
  "Content-Type": "application/x-www-form-urlencoded"
});

@Injectable()
export class AuthService {
  Users = [];
  listaUsers = [];

  constructor(
    public http: Http,
    public dataService: DataService,
    private utils: Utils
  ) {
    this.auth().subscribe();
  }

  // SERVICE CALLS

  public checkDNI(data): Observable<any> {
    return this.http
      .post(SERVER_URL + API.login, data, { headers })
      .timeout(Config.OPTIONS.REQUEST_TIMEOUT)
      .map(res => {
        return res.json().preguntas;
      })
      .catch(err => {
        if (err.status === 401) {
          // Token might be expired, try to refresh token
          return this.auth().mergeMap(res => {
            // Use mergeMap instead of map
            if (!res) return Observable.throw(err);
            // Retry with new token
            return this.http
              .post(SERVER_URL + API.login, data, { headers })
              .timeout(Config.OPTIONS.REQUEST_TIMEOUT)
              .map(res => {
                return res.json().preguntas;
              })
              .catch(err => {
                return Observable.throw(err);
              });
          });
        } else {
          if (err.status === 502) {
            //para que muestre el mensaje solicitado correctamente            
            this.utils.showAlert("Error", err.json().error);
            return;
          }
          else if(err.status === 409){
            this.utils.showAlert("Error",err.json().mensaje);
          }
          else if (err.status === 408 || err.status === 504 || err.name === 'TimeoutError') {            
            this.utils.showAlert("Lo sentimos", Config.MSG.TIMEOUT_ERROR);
            return;
          }
          return Observable.throw(err);
        }
      });
  }

  public answer(dni, resultOk): Observable<any> {
    console.log("answer Request: ", { dni });
    const endpoint = resultOk ? API.ok : API.nok;
    return this.http
      .post(SERVER_URL + endpoint, { dni }, { headers })
      .timeout(Config.OPTIONS.REQUEST_TIMEOUT)
      .map(res => {
        console.log("answer Response: ", res.json());
        return res.json().preguntas;
      })
      .catch(err => {
        if (err.status === 401) {
          // Token might be expired, try to refresh token
          return this.auth().mergeMap(res => {
            // Use mergeMap instead of map
            if (!res) return Observable.throw(err);
            // Retry with new token
            return this.http
              .post(SERVER_URL + endpoint, { dni }, { headers })
              .timeout(Config.OPTIONS.REQUEST_TIMEOUT)
              .map(res => {
                console.log("answer Response: ", res.json());
                return res.json().preguntas;
              });
          });
        }
        return Observable.throw(err || "Server error");
      });
  }

  private auth(): Observable<any> {
    return this.http
      .post(SERVER_URL + API.auth, authBody, { headers: authHeaders })
      .map(res => {
        const token = res.json().accessToken;
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
          console.log("El token de seguridad se ha actualizado correctamente.");
        } else {
          console.log("El token de seguridad no se ha podido actualizar.");
        }
        return !!token;
      })
      .catch(err => {
        return Observable.throw(err || "Server error");
      });
  }

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

  public checkPreguntas(preguntas) {
    return new Promise((resolve, reject) => {
      let wrong = preguntas.filter(p => p.respuesta !== p.correcta);
      if (wrong.length) return reject("Wrong answers");
      resolve();
    });
  }

  public isAuthenticated() {
    const expires = this.utils.getItem(Config.KEY.EXPIRES);
    return expires && Date.now() < expires;
  }
}
