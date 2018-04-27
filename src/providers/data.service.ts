import { Injectable } from '@angular/core'
import { Http, Headers, RequestOptions } from '@angular/http'
import { Observable } from 'rxjs'
import 'rxjs/Rx'
import 'rxjs/add/operator/map'
import { Subject } from 'rxjs/Subject'

import { Utils } from './utils'

import { Config } from '../app/config'


const { API, SERVER_URL, authBody } = Config
const headers = new Headers({ 'Content-Type': 'application/json' })
const authHeaders = new Headers({
    'Authorization': 'Bearer',
    'Content-Type': 'application/x-www-form-urlencoded'
})


@Injectable()
export class DataService {

    app

    telefonos = [
        {
            telefono: 'default',
            detalle: '0810-010-1199'
        }
    ]
    indexTelefonos = 0

    usersChange: Subject<any> = new Subject<any>()

    constructor(
        public http: Http,
        private utils: Utils
    ) {
        this.auth().subscribe()
        this.restoreTelefonos()
    }


    // SERVICE CALLS

    public getTelefonos(dni?): Observable<any> {
        dni = dni || this.utils.getActiveUser()
        console.log('getTelefonos Request:', dni)
        return this.http.post(SERVER_URL + API.telefonos, { dni }, { headers })
            .map(this.handleTelefonos.bind(this, dni))
            .catch(err => {
                if (err.status === 401) {
                    // Token might be expired, try to refresh token
                    return this.auth().mergeMap(res => { // Use mergeMap instead of map
                        if (res === true) {
                            // Retry with new token
                            return this.http.post(SERVER_URL + API.telefonos, { dni }, { headers })
                                .map(this.handleTelefonos.bind(this, dni))
                                .catch(err => {
                                    this.restoreTelefonos(dni)
                                    return Observable.throw(err || 'Server error')
                                })
                        }
                        this.restoreTelefonos(dni)
                        return Observable.throw(err)
                    })
                }
                this.restoreTelefonos(dni)
                return Observable.throw(err || 'Server error')
            })
    }

    handleTelefonos(dni, res) {
        let response = res.json()
        console.log('getTelefonos Response:', response.telefonos)
        if (response.telefonos.length > 0) {
            this.telefonos = response.telefonos
            this.saveTelefonos(response.telefonos, dni)
        }
        return response
    }


    public getDatosSocio(dni?): Observable<any> {
        dni = dni || this.utils.getActiveUser()
        console.log('getDatosSocio Request:', dni)
        return this.http.post(SERVER_URL + API.datosSocio, { dni }, { headers })
            .map(this.handleMisDatos.bind(this, dni))
            .catch(err => {
                if (err.status === 401) {
                    // Token might be expired, try to refresh token
                    return this.auth().mergeMap(res => { // Use mergeMap instead of map
                        if (res === true) {
                            // Retry with new token
                            return this.http.post(SERVER_URL + API.datosSocio, { dni }, { headers })
                                .map(this.handleMisDatos.bind(this, dni))
                                .catch(err => {
                                    this.error('misDatos', err)
                                    return [this.restoreMisDatos(dni)]
                                })
                        }
                        this.error('misDatos', err)
                        return [this.restoreMisDatos(dni)]
                    })
                }
                this.error('misDatos', err)
                return [this.restoreMisDatos(dni)]
            })
    }

    handleMisDatos(dni, res) {
        const data = res.json()
        //agrego dni dentro de mis datos
        data.dni = dni;
        console.log('getDatosSocio Response:', data)
        this.saveMisDatos(data, dni)
        return data
    }


    public getHistorial(dni?): Observable<any> {
        dni = dni || this.utils.getActiveUser()
        console.log('getHistorial Request:', dni)
        return this.http.post(SERVER_URL + API.historial, { dni }, { headers })
            .map(this.handleHistorial.bind(this, dni))
            .catch(err => {
                if (err.status === 401) {
                    // Token might be expired, try to refresh token
                    return this.auth().mergeMap(res => {
                        if (res === true) {
                            // Retry with new token
                            return this.http.post(SERVER_URL + API.historial, { dni }, { headers })
                                .map(this.handleHistorial.bind(this, dni))
                                .catch(err => {
                                    this.error('historial', err)
                                    return this.restoreHistorial(dni) || []
                                })
                        }
                        this.error('historial', err)
                        return this.restoreHistorial(dni) || []
                    })
                }
                this.error('historial', err)
                return this.restoreHistorial(dni) || []
            })
    }

    handleHistorial(dni, res) {
        let data = res.json()
        data = data && data.historialAtencion
        if (!data) throw 'Invalid data'
        console.log('getHistorial Response:', data)
        this.saveHistorial(data, dni)
        return data
    }

    registrarDispositivo(idDevice, dni): Promise<any> {
        console.log('registrar Dispositivo en BD Request: ', idDevice);
        const datos = { "dni": dni, "deviceId": idDevice };


        let deviceRegisterPromise = new Promise((resolve, reject) => {

            this.http.post(SERVER_URL + API.registroDispositivo, datos, { headers })
            .toPromise()
            .then(
                res => { // Success
                    console.log("Se Registro el Device Correctamente");
                    resolve();
            })
            .catch(error => {
                if (error.status === 401) {
                    // Token might be expired, try to refresh token
                    return this.auth().mergeMap(res => {
                        if (res === true) {
                            // Retry with new token
                            return this.http.post(SERVER_URL + API.registroDispositivo, datos, { headers })
                                .toPromise()
                                .then(
                                    res => { // Success
                                        console.log("Se Registro el Device Correctamente");
                                        resolve();
                                })
                                .catch(err => {
                                    console.log("No Se Puede Registrar el Dispositivo");
                                    reject();
                                })
                        }
                        console.log("No Se Puede Registrar el Dispositivo");
                        reject();
                    })
                }
                console.log("No Se Puede Registrar el Dispositivo");
                reject();
             });
        });

        return deviceRegisterPromise;
    }

    public getSintomas(): Observable<any> {
        let dni = this.utils.getActiveUser()

        let options = new RequestOptions({ headers: headers });

        return this.http.get(SERVER_URL + API.sintomas, options)
            .map(this.handleSintomas.bind(this, dni))
            .catch(err => {
                if (err.status === 401) {
                    // Token might be expired, try to refresh token
                    return this.auth().mergeMap(res => {
                        if (res === true) {
                            // Retry with new token
                            return this.http.get(SERVER_URL + API.sintomas, options)
                                .map(this.handleSintomas.bind(this, dni))
                                .catch(err => {
                                    this.error('sintomas', err)
                                    return this.restoreSintomas(dni) || []
                                })
                        }
                        this.error('sintomas', err)
                        return this.restoreSintomas(dni) || []
                    })
                }
                this.error('sintomas', err)
                return this.restoreSintomas(dni) || []
            })
    }

    handleSintomas(dni, res) {

        let data = res.json();
        console.log('getSintomas Response:', data);
        this.saveSintomas(data, dni)
        return data;

    }

    public solicitarVC(data): Observable<any> {
        console.log('solicitarVC Request: ', data)
        return this.http.post(SERVER_URL + API.solicitarVC, data, { headers })
            .map(res => {
                const data = res.json()
                console.log('solicitarVC Response: ', data)
                return data
            })
            .catch(err => {
                if (err.status === 401) {
                    // Token might be expired, try to refresh token
                    return this.auth().mergeMap(res => {
                        if (res === true) {
                            // Retry with new token
                            return this.http.post(SERVER_URL + API.solicitarVC, data, { headers })
                                .map(res => {
                                    const data = res.json()
                                    console.log('solicitarVC Response: ', data)
                                    return data
                                })
                        }
                        return Observable.throw(err)
                    })
                }
                return Observable.throw(err || 'Server error')
            })
    }


    public responderEncuesta(data): Observable<any> {
        console.log('responderEncuesta Request: ', data)
        return this.http.post(SERVER_URL + API.responderEncuesta, data, { headers })
            .map(res => {
                const data = res.json()
                console.log('responderEncuesta Response: ', data)
                return data
            })
            .catch(err => {
                if (err.status === 401) {
                    // Token might be expired, try to refresh token
                    return this.auth().mergeMap(res => {
                        if (res === true) {
                            // Retry with new token
                            return this.http.post(SERVER_URL + API.responderEncuesta, data, { headers })
                                .map(res => {
                                    const data = res.json()
                                    console.log('responderEncuesta Response: ', data)
                                    return data
                                })
                        }
                        return Observable.throw(err)
                    })
                }
                return Observable.throw(err || 'Server error')
            })
    }


    private auth(): Observable<any> {
        return this.http.post(SERVER_URL + API.auth, authBody, { headers: authHeaders })
            .map(res => {
                let token = res.json().accessToken
                if (token) {
                    headers.set('Authorization', `Bearer ${token}`)
                    console.log('El token de seguridad se ha actualizado correctamente.')
                }
                else {
                    console.log('El token de seguridad no se ha podido actualizar.')
                }
                return token
            })
            .catch(error => {
                return Observable.throw(error || 'Server error')
            })
    }


    public validarVC(dni): Observable<any> {

        console.log("validarVC Request URL:" + SERVER_URL + API.validarVC + dni)

        return this.http.get(SERVER_URL + API.validarVC + dni, { headers })
            .map(res => {
                const data = res.json()
                console.log('validarVC devuelve: ', data)
                return data
            })
            .catch(err => {
                if (err.status === 401) {
                    // Token might be expired, try to refresh token
                    return this.auth().mergeMap(res => {
                        if (res === true) {
                            // Retry with new token
                            return this.http.get(SERVER_URL + API.validarVC + dni, { headers })
                                .map(res => {
                                    const data = res.json()
                                    console.log('validate  VC Response: ', data)
                                    return data
                                })
                        }
                        return Observable.throw(err)
                    })
                }
                return Observable.throw(err || 'Server error')
            })
    }


    handleValidationVC(res) {
        console.log('handleValidationVC')
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
        const telefonos = this.getLocalStorage(Config.KEY.TELEFONOS, dni)
        if (telefonos) this.telefonos = telefonos
    }
    public saveTelefonos(data, dni?) {
        if (!data) return
        this.setLocalStorage(Config.KEY.TELEFONOS, data, dni)
    }

    public restoreAlertas(dni?) {
        return this.getLocalStorage(Config.KEY.ALERTAS, dni)
    }
    public saveAlertas(data, dni?) {
        if (!data) return
        this.setLocalStorage(Config.KEY.ALERTAS, data, dni)
    }

    public restoreSintomas(dni?) {
        return this.getLocalStorage(Config.KEY.SINTOMAS, dni)
    }
    public saveSintomas(data, dni?) {
        if (!data) return
        this.setLocalStorage(Config.KEY.SINTOMAS, data, dni)
    }


    public getLocalStorage(prop, dni?) {
        dni = dni || this.utils.getActiveUser()
        if (!dni) {
            console.warn(`Cannot get [${prop}] from Local Storage: no dni available`)
            return false
        }
        const data = this.utils.getItem(dni)
        console.log(`Restored [${prop}] from Local Storage`)
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


    // public restoreUsers() {
    //   return this.utils.getItem(Config.KEY.USERS) || []
    // }

    public restoreUsers() {
        return this.utils.getItem(Config.KEY.USERS) || []
    }

    public saveUsers(data, noupdate?) {
        if (!data) return
        this.utils.setItem(Config.KEY.USERS, data)
        if (noupdate) return
        this.updateUsers(data)
    }

    public restoreGuestUsers() {
        return this.utils.getItem(Config.KEY.GUESTUSERS) || []
    }

    public saveGuestUsers(data, noupdate?) {
        if (!data) return
        this.utils.setItem(Config.KEY.GUESTUSERS, data)
        if (noupdate) return
        this.updateUsers(data)
    }

    // public getUsersData(users?) {
    //   users = users || this.restoreUsers()
    //   const activeUser = this.utils.getActiveUser()
    //   let data
    //   const usersData = users.map(user => {
    //     data = this.utils.getItem(user)
    //     data = data && data.misDatos
    //     if (!data) console.warn('Data for user [%s] is missing!', user)
    //     return {
    //       dni : user,
    //       nombre : data && (data.nombre + ' ' + data.apellido),
    //       nroSocio : data && data.datosCredencial[0].nroasociado,
    //       delete : false,
    //       active : user === activeUser
    //     }
    //   })
    //   return usersData
    // }

    public getUsersData(users?) {

        const activeUser = this.utils.getActiveUser()

        if (users) {
            users = users
        }
        else if (this.isTitular(activeUser)) {
            users = this.restoreUsers();
        }
        else {
            users = this.restoreGuestUsers();
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
        this.usersChange.next(this.getUsersData(users))
    }


    public addUser(dni, noupdate?) {
        if (!dni) return
        const users = this.restoreUsers()
        users.push(dni)
        this.saveUsers(users, noupdate)
    }


    public addUserGuest(dni, noupdate?) {
        if (!dni) return
        const users = this.restoreGuestUsers()
        users.push(dni)
        this.saveGuestUsers(users, noupdate)
    }

    public removeUsers(dnis) {
        if (!dnis) return
        const users = this.restoreUsers()
        const removeActive = dnis.includes(this.utils.getActiveUser())
        console.log('Removing users:', users.filter(dni => dnis.includes(dni)))
        dnis.forEach(dni => this.utils.delItem(dni))
        if (removeActive) this.app.logout()
        // FIXME: here be bugs
        this.saveUsers(users.filter(dni => !dnis.includes(dni)), removeActive)
    }


    public getPhoneNumber() {
        const tel = this.telefonos[this.indexTelefonos]
        return tel && tel.detalle
    }
    public nextPhoneNumber() {
        console.log('Switching phone number')
        this.indexTelefonos++
        if (this.indexTelefonos === this.telefonos.length) {
            this.indexTelefonos = 0
        }
        return this.getPhoneNumber()
    }

    error(prop, err) {
        console.error('Could not get [' + prop + ']: ' + (err || 'Server error'))
    }


}
