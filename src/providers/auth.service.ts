import { $CARET } from '@angular/compiler/src/chars';
import { AlertService } from './alert.service';
import { Injectable } from "@angular/core";
import { Http, Headers, Response } from "@angular/http";
import { Observable } from "rxjs";
import 'rxjs/Rx';
import 'rxjs/add/operator/map';

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
    private utils: Utils,
    private alertService: AlertService
  ) {

  }

  // SERVICE CALLS
  public auth(): Observable<any> {
    return this.http
      .post(SERVER_URL + API.auth, authBody, { headers: authHeaders })
      .map(res => {
        console.log("BK: /auth");
        let token = res.json().accessToken;
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


  public retryPOST(datos, api: String): Observable<Response> {
    // Retry with new token
    return this.http.post(SERVER_URL + api, datos, { headers })
      .map(res => { // Success
        console.log("Retry  Success in BK: {} Service. ", api);
        return res;
      })
      .catch(err => {
        console.log("Retry Error in BK: {} Service. ", api);
        return Observable.throw(err);
      })
  }


  public retryGETService(api: String, options: any): Observable<any> {
    // Retry with new token
    return this.http.get(SERVER_URL + api, options)
      .map(res => { return res; })
      .catch(err => {
        return Observable.throw(err);
      })
  }



  public getActualHeaders(): Headers {
    return headers;
  }



  public checkDNI(data): Observable<any> {
    console.log("Entra en auth.checkDNI")
    return this.http
      .post(SERVER_URL + API.login, data, { headers })
      .timeout(Config.OPTIONS.REQUEST_TIMEOUT)
      .map(res => {
        console.log("BK: /socio/login ")
        return res.json();
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
                return res.json();
              })
              .catch(err => {
                return Observable.throw(err);
              });
          });
        } else {
          if (err.status === 502 || err.status === 500) {
            //para que muestre el mensaje solicitado correctamente            
            this.alertService.showAlert(Config.TITLE.WARNING_TITLE, Config.MSG.CONNECTION_ERROR,Config.ALERT_CLASS.ERROR_CSS);
            this.utils.hideLoader();
            return;
          }
          else if (err.status === 409) {                       
            let mensaje;
            try{
              mensaje = err.json().mensaje;
            }
            catch{
              mensaje = Config.MSG.TIMEOUT_ERROR;
            }
            this.alertService.showAlert(Config.TITLE.WARNING_TITLE, mensaje,Config.ALERT_CLASS.ERROR_CSS);
            this.utils.hideLoader();
            return;
          }
          else if (err.status === 408 || err.status === 504 || err.name === 'TimeoutError') {
            this.alertService.showAlert(Config.TITLE.WE_ARE_SORRY, Config.MSG.TIMEOUT_ERROR,Config.ALERT_CLASS.ERROR_CSS);
            this.utils.hideLoader();
            return;
          }
          if (err.message == "Timeout has occurred") {
            this.alertService.showAlert(Config.TITLE.WE_ARE_SORRY, Config.MSG.TIMEOUT_ERROR,Config.ALERT_CLASS.ERROR_CSS);
            this.utils.hideLoader();
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
        console.log("BK: POST answer Response: ", res.json());
        return res.json();
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
                return res.json();
              });
          });
        }
        return Observable.throw(err || "Server error");
      });
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
