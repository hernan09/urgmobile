import { Observable } from 'rxjs';
import { HomePage } from './../pages/home/home';
import { NavController } from 'ionic-angular';
import { AlertService } from './alert.service';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core'
import {RequestOptions, Request, RequestMethod, Http, Headers, Response} from '@angular/http';
import 'rxjs/Rx'
import 'rxjs/add/operator/map'
import { Subject } from 'rxjs/Subject'
import { Utils } from './utils'
import { Config } from '../app/config'


const { API, SERVER_URL, authBody } = Config;
const authHeaders = new Headers({
    'Authorization': 'Bearer',
    'Content-Type': 'application/x-www-form-urlencoded'
});


@Injectable()
export class DataService {

    app

    public telefonos = [
        {
            telefono: 'default',
            detalle: '0810-333-3511'
        },
        {
            telefono: '2',
            detalle: '0810-444-3511'
        }
    ];

    blockedUserPhoneNumber = {
        description: 'block user',
        number: '0800-444-3511'
    };

    private indexTelefonos = 0;

    public usersChange: Subject<any> = new Subject<any>();

    constructor(
        public http: Http,
        private utils: Utils,
        private authService: AuthService,
        private alertService : AlertService,

    ) {
        this.authService.auth().subscribe()
        this.restoreTelefonos()
    };


    // SERVICE CALLS

    public getTelefonos(dni?): Observable<any> {
        dni = dni || this.utils.getActiveUser()
        console.log('BK: getTelefonos using dni:{}', dni);
        //Se obtiene el token actualizado según auth
        let headers :Headers = this.authService.getActualHeaders();
        return this.http.post(SERVER_URL + API.telefonos, { dni }, { headers })
            .map(this.handleTelefonos.bind(this, dni))
            .catch(err => {
                if (err.status === 401) {
                    console.log('BK: Reintento getTelefonos x Token');
                    // Token might be expired, try to refresh token
                    return this.authService.auth().mergeMap(res => { // Use mergeMap instead of map
                        if (res === true) {
                            // Retry with new token
                            return this.authService.retryPOST({ dni }, API.telefonos)
                            .map(this.handleTelefonos.bind(this, dni))
                            .catch(err => {return this.showTelefonosError(err,dni);})
                        }
                        return this.showTelefonosError(err,dni);
                    })
                }
                return this.showTelefonosError(err,dni);
            })
    }


    private showTelefonosError(err,dni):any{
        this.restoreTelefonos(dni);
        return this.throwObservableError(err);
    }

    handleTelefonos(dni, res) {
        let response = res.json();
        if (response.telefonos.length > 0) {
            this.telefonos = response.telefonos;
            console.log('handleTelefonos',this.telefonos);
            this.saveTelefonos(response.telefonos, dni);
        }
        return response;
    }


    public getDatosSocio(dni?): Observable<any> {
        dni = dni || this.utils.getActiveUser()
        console.log('BK: getDatosSocio Request:', dni)
        //Se obtiene el token actualizado según auth
        let headers :Headers = this.authService.getActualHeaders();
        return this.http.post(SERVER_URL + API.datosSocio, { dni }, { headers })
            .map(this.handleMisDatos.bind(this, dni))
            .catch(err => {
                if (err.status === 401) {

                    console.log('BK: Reintento getDatosSocio x Token');
                    // Token might be expired, try to refresh token
                    return this.authService.auth().mergeMap(res => { // Use mergeMap instead of map
                        if (res === true) {
                            // Retry with new token
                            return this.authService.retryPOST({ dni }, API.datosSocio)
                            .map(this.handleMisDatos.bind(this, dni))
                            .catch(err => { return this.showMisDatosError(err,dni); })
                        }
                        return this.showMisDatosError(err,dni);
                    })
                }
                return this.showMisDatosError(err,dni);
            })
    }


    private handleMisDatos(dni, res) {
        const data = res.json();
        //agrego dni dentro de mis datos
        data.dni = dni;;
        this.saveMisDatos(data, dni);
        return data;
    }
    private showMisDatosError(err,dni):any{
        this.error('misDatos', err);
        return [this.restoreMisDatos(dni)];
    }


    public getHistorial(dni?): Observable<any> {
        dni = dni || this.utils.getActiveUser()
        console.log('BK: getHistorial Request:', dni);
        //Se obtiene el token actualizado según auth
        let headers :Headers = this.authService.getActualHeaders();
        return this.http.post(SERVER_URL + API.historial, { dni }, { headers })
            .map(this.handleHistorial.bind(this, dni))
            .catch(err => {
                if (err.status === 401) {
                    console.log('BK: Reintento getHistorial x Token');
                    // Token might be expired, try to refresh token
                    return this.authService.auth().mergeMap(res => {
                        if (res === true) {
                            return this.authService.retryPOST({ dni }, API.historial)
                                .map(this.handleHistorial.bind(this,dni))
                                .catch(err => {return this.showHistorialError(err,dni);})
                        }
                        return this.showHistorialError(err,dni);
                    })
                }
                return this.showHistorialError(err,dni);
            })
    }

    private handleHistorial(dni, res) {
        let data = res.json()
        console.log('getHistorial Response:', data)
        if (data) {
            this.saveHistorial(data, dni)
        }
        return data;
    }

    private  showHistorialError(err,dni):any{
        this.error('historial', err)
        return [this.restoreHistorial(dni)] || []
    }

    public getHistorialNotifications(dni?) {
        dni = dni || this.utils.getActiveUser()
        console.log('getHistorial Request:', dni)
        this.restoreHistorial(dni)
    }


    public registrarDispositivo(idDevice, dni): Observable<Response> {

        const datos = { "dni": dni, "deviceId": idDevice };
        console.log("BK: registrar Dispositivo: {}, datos a registrar:{} ",idDevice, datos);
        //Se obtiene el token actualizado según auth
        let headers :Headers = this.authService.getActualHeaders();
        return this.http.post(SERVER_URL + API.registroDispositivo, datos, { headers })
            .map(res => { // Success
                console.log("data.service - Device registration success");
                return res;
            })
            .catch(error => {
                if (error.status === 401) {
                    // Token might be expired, try to refresh token
                    return this.authService.auth().mergeMap(res => {
                        if (res === true) {
                            return this.authService.retryPOST(datos, API.registroDispositivo)
                                    .map(res=> {console.log("data.service - retry Device registration ");
                                    return res;})
                            .catch(err => {return this.throwObservableError(err);})
                        }
                       return this.throwObservableError(error);
                    })
                }
                return this.throwObservableError(error);
            });
    }

    private throwObservableError(error){
        console.log("throwObservableError: ",error);
        return Observable.throw(error || 'Server error');
    }


    public getSintomas(): Observable<any> {
        let dni = this.utils.getActiveUser()
        //Se obtiene el token actualizado según auth
        let headers :Headers = this.authService.getActualHeaders();
        let options = new RequestOptions({ headers: headers });
        console.log("BK: getSintomas");
        return this.http.get(SERVER_URL + API.sintomas, options)
            .map(this.handleSintomas.bind(this, dni))
            .catch(err => {
                if (err.status === 401) {
                    console.log("BK: reintento getSintomas");
                    // Token might be expired, try to refresh token
                    return this.authService.auth().mergeMap(res => {
                        if (res === true) {
                            // Retry with new token
                            return this.authService.retryGETService(API.sintomas,options)
                            .map(res => {this.handleSintomas.bind(this, dni);})
                            .catch(err => {return this.showSintomasError(err,dni);})
                        }
                        return this.showSintomasError(err,dni);
                    })
                }
                return this.showSintomasError(err,dni);            })
    }


    private handleSintomas(dni, res) {
        let data = res.json();
        console.log('getSintomas Response:', data);
        this.saveSintomas(data, dni)
        return data;
    }
    private showSintomasError(err,dni){
        this.error('sintomas', err);
        return this.restoreSintomas(dni) || []
    }



    public solicitarVC(data): Observable<any> {
        //Se obtiene el token actualizado según auth
        let headers :Headers = this.authService.getActualHeaders();

        console.log('BK: solicitarVC con parametros: ',data);
        return this.http.post(SERVER_URL + API.solicitarVC, data, { headers })
            .map(res => {
                const data = res.json()
                console.log('BK: solicitarVC Response: ', data)
                return data
            })
            .catch(err => {
                if (err.status === 401) {
                    // Token might be expired, try to refresh token
                    return this.authService.auth().mergeMap(res => {
                        if (res === true) {
                            // Retry with new token
                            return this.authService.retryPOST({ data }, API.solicitarVC)
                            .map(res => {
                                console.log('BK: Reintento solicitarVC Response: ',res);
                                return this.getResponseData(res);
                            })
                            .catch(err => {
                                this.error('BK: Erro al solicitarVC', err);
                                return Observable.throw(err)
                            })
                        }
                        return Observable.throw(err)
                    })
                }
                return Observable.throw(err || 'Server error')
            })
    }


    public responderEncuesta(data): Observable<any> {
        //Se obtiene el token actualizado según auth
        let headers :Headers = this.authService.getActualHeaders();
        return this.http.post(SERVER_URL + API.responderEncuesta, data, { headers })
            .map(res => {return this.getResponseData(res);})
            .catch(err => {
                if (err.status === 401) {
                    console.log('BK: Reintento responderEncuesta Request: ', data)
                    // Token might be expired, try to refresh token
                    return this.authService.auth().mergeMap(res => {
                        if (res === true) {

                            return this.authService.retryPOST({ data }, API.responderEncuesta)
                            .map(res => {return this.getResponseData(res);})
                            .catch(err => {
                                this.error('Erro al responder encuesta', err);
                                return Observable.throw(err)
                            })
                        }
                        return Observable.throw(err)
                    })
                }
                return Observable.throw(err || 'Server error')
            })
    }


    public validarVC(dni:string, soloservicio:string): Observable<any> {

        //Se obtiene el token actualizado según auth
        let headers: Headers = this.authService.getActualHeaders();

        let params= "?dni="+dni+"&soloservicio="+soloservicio;
        console.log("validarVC Request : " + params);
        //let options = new RequestOptions({headers:myheaders, search:myParams });

        return this.http.get(SERVER_URL + API.validarVC+params, {headers})
            .map(response => {return response;})
            .catch(err => {
                if (err.status === 401) {
                    console.log('BK : Reintenta validarVC por auth ')
                    // Token might be expired, try to refresh token
                    return this.authService.auth().mergeMap(res => {
                        if (res === true) {
                            this.authService.retryGETService(API.validarVC, {headers, params })
                                .map(response2 => { return response2})
                                .catch(err => { return Observable.throw(err);})
                        }
                        return Observable.throw(err)
                    })
                }
                return Observable.throw(err || 'Server error')
            })
    }

    //Obtiene la info dentro del response
    public getResponseData(res):any{
        const data = res.json();
        return data;
    }

    private handleValidationVC(res) {
        let response = res.json()
        return response
    }

    // UTILS
    public restoreHistorial(dni?) {
        return this.getLocalStorage(Config.KEY.HISTORIAL, dni)
    }
    public saveHistorial(data, dni?) {
        if (!data) return
        this.setLocalStorage(Config.KEY.HISTORIAL, data, dni)
    }

    public restoreMisDatos(dni?) {
        return this.getLocalStorage(Config.KEY.MIS_DATOS, dni)
    }
    public saveMisDatos(data, dni?) {
        if (!data) return
        this.setLocalStorage(Config.KEY.MIS_DATOS, data, dni)
    }

    public restoreTelefonos(dni?) {
        var telefonos = this.getLocalStorage(Config.KEY.TELEFONOS, dni)
        if (telefonos){
          this.telefonos = telefonos;
        } else{
        }
    }
    public saveTelefonos(data, dni?) {
        if (!data) return
        this.setLocalStorage(Config.KEY.TELEFONOS, data, dni)
    }

    public restoreAlertas(dni?) {
        return this.utils.getAlerts();
    }
    public saveAlertas(data) {
        if (!data) return
        this.utils.setAlert(data)
    }


    public saveCID(data) {
        if (!data) return
        this.utils.setCID(data);
    }

    public restoreCID() {
        this.utils.getCID();
    }


    public restoreSintomas(dni?) {
        return this.getLocalStorage(Config.KEY.SINTOMAS, dni)
    }
    public saveSintomas(data, dni?) {
        if (!data) return
        this.setLocalStorage(Config.KEY.SINTOMAS, data, dni)
    }

    public getVCStatus(){
        return this.utils.getItem(Config.KEY.VC_STATUS);
      }

      public setVCStatus(data){
        this.utils.setItem(Config.KEY.VC_STATUS, data);
      }

      public getSurveyStatus(){
        return this.utils.getItem(Config.KEY.SURVEY_STATUS);
      }

      public setSurveyStatus(data){
        this.utils.setItem(Config.KEY.SURVEY_STATUS, data);
      }


    public getLocalStorage(prop, dni?) {
        dni = dni || this.utils.getActiveUser()
        if (!dni) {
            console.warn(`Cannot get [${prop}] from Local Storage: no dni available`)
            return false
        }
        const data = this.utils.getItem(dni)
        console.log(`Restored [${prop}] from Local Storage`,data);
        return data && data[prop]
    }
    public setLocalStorage(prop, propdata, dni?) {
        dni = dni || this.utils.getActiveUser()
        const data = this.utils.getItem(dni)
        if (data) {
            data[prop] = propdata
            this.utils.setItem(dni, data)
        }
        else {
            this.utils.setItem(dni, { [prop]: propdata })
        }
        console.log(`Saved [${prop}] in Local Storage`)
    }

    public restoreUsers() {
        return this.utils.getItem(Config.KEY.USERS) || []
    }

    public saveUsers(data, noupdate?) {
        if (!data) return
        this.utils.setItem(Config.KEY.USERS, data)
        if (noupdate) return
        this.updateUsers(data)
    }


    public getUsersData(users?) {
        const activeUser = this.utils.getActiveUser()

        if (users) {
            users = users
        }
        else if (this.isTitular(activeUser)) {
            users = this.restoreUsers();
        }

        let data
        const usersData = users.map(user => {
            data = this.utils.getItem(user)
            data = data && data.misDatos
            if (!data) console.warn('Data for user [%s] is missing!', user)
            return {
                dni: user,
                nombre: data && (data.nombre + ' ' + data.apellido),
                nroSocio: data && data.datosCredencial[0].nroasociado,
                delete: false,
                active: user === activeUser
            }
        })
        return usersData
    }

    public isTitular(user) {
        const users = this.restoreUsers();
        return users.indexOf(user) !== -1;
    }

    public updateUsers(users?) {
        // notify subscribed components
        console.log('Updating users... ', users)
        if (users) this.usersChange.next(this.getUsersData(users))
    }


    public addUser(dni, noupdate?) {
        if (!dni) return
        const users = this.restoreUsers()
        users.push(dni)
        this.saveUsers(users, noupdate)
    }

    public removeUsers(dniToRemove) {
        if (!dniToRemove) return
        var users
        var removeActive

        if (this.isTitular(dniToRemove)) {
            users = this.restoreUsers()
        }

        removeActive = dniToRemove == this.utils.getActiveUser();
        this.utils.delItem(dniToRemove)
        if (this.isTitular(dniToRemove)) {
            this.saveUsers(users.filter(dni => dni != dniToRemove), removeActive)
        }
    }

    public removeAllUsers() {
        //elimino todas las keys
        var users = this.restoreUsers();
        for (let i = 0; i < users.length; i++) {
            this.utils.delItem(users[i]);
        }
        //vacio la lista de usuarios
        this.saveUsers([], true);
    }


    public getPhoneNumber() {
        var tel = this.telefonos[this.indexTelefonos]
        if(tel == undefined) {
          tel =  {
              telefono: 'default',
              detalle: '0810-333-3511'
          };
        }
        return tel && tel.detalle
    }


    public nextPhoneNumber() {
        console.log('Switching phone number data service',this.indexTelefonos)
        console.log('this.telefonos.length dataservice',this.telefonos.length)
        this.indexTelefonos++
        console.log('Switching phone number2 data service',this.indexTelefonos)
        if (this.indexTelefonos === this.telefonos.length) {
            this.indexTelefonos = 0
        }
        return this.getPhoneNumber()
    }

    public getBlockUserPhoneNumber() {
        const tel = this.blockedUserPhoneNumber;
        return tel && tel.number
    }

    public validateAvailableVC(dni): Observable<any>{
        console.log("LLamado a validateAvailableVC con DNI: " + dni);
        return this.validarVC(dni, "SI").map(
            (res)=> {return this.getResponseData(res);
            })
            .catch(err =>{
                this.error('Erro al solicitarVC', err);
                return Observable.throw(err);
        });

      };

    error(prop, err) {
        console.error('Could not get [' + prop + ']: ' + (err || 'Server error'))
    }


    updateTelefono() {
		console.log("data.services - updateTelefono: get phone numbers from URG if exists, other way get the static phone numbers")
		this.getTelefonos().subscribe(
			data => {
        console.log("Se pudieron obtener los telefonos: ",data);
				this.saveTelefonos(data);
			},
			err => {
				console.log("No se pudieron obtener los telefonos: ",err);
			}
		)
	}


}
