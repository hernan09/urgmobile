import { ENV } from '@app/env';
import { AndroidPermissions } from '@ionic-native/android-permissions';

export class Config {

	public static OPTIONS = {
		EXPIRE_TIME : 30 * 24 * 60, // login expire time, in minutes
		REQUEST_TIMEOUT : 7000, // for some backend requests, in milliseconds		
		NOTI_SIM_DELAY : 0, //notification simulation delay, in seconds (0: disable simulation
		VERSION_NUMBER : '1.0.16'
	}

	public static getEnv(){
		console.log("El env apunta a : " + ENV.mode);
		console.log("SERVER_URL", this.SERVER_URL);
		console.log("VC_SERVERS", this.VC_SERVER_URL);
		console.log("ONE_SIGNAL_ID", this.ONE_SIGNAL_ID_APP);
		console.log("GOOGLE_PROJECT_NUMBER", this.GOOGLE_PROJECT_NUMBER_APP);
	}

	public static API = {
		auth: '/auth',
		login: '/socio/login',
		ok: '/socio/respuestaOk/',
		nok: '/socio/respuestaIncorrecta/',
		telefonos: '/socio/telefonos/',
		datosSocio: '/socio/datosSocio/',
		historial: '/socio/atencion/',
		responderEncuesta: '/encuesta/respuesta',
		sintomas: '/sintoma/sintomas',
		solicitarVC : '/vc/solicitar',
		validarVC : '/vc/validar',
		registroDispositivo: '/socio/registrarDispositivo'
	}

	public static SERVER_URL = ENV.server;	
	
	public static VC_SERVER_URL = ENV.vc_server;	
	
	public static ONE_SIGNAL_ID_APP = ENV.oneSignal_id;	
	
	public static GOOGLE_PROJECT_NUMBER_APP = ENV.google_pj;

	public static authBody = getAuthBody();	

	public static KEY = {
		TITULAR : 'titular',
		ACTIVE : 'active',
		EXPIRES : 'expires',
		USERS : 'users',
		HISTORIAL : 'historial',
		MIS_DATOS : 'misDatos',
		TELEFONOS : 'telefonos',
		ALERTAS : 'alertas',
		SINTOMAS: 'sintomas',
		CID : 'cid',
		VC_STATUS : 'videoconsulta-status',		
	}


	public static TITLE = {
		VIDEO_CALL_TITLE:'Video Consulta',
		WARNING_TITLE:'Atención',
		WE_ARE_SORRY : 'Lo sentimos',
		WRONG_NUMBER : 'Número de telefono erroneo',
		WRONG_EMAIL : 'Formato de email incorrecto',		
	}


	public static ALERT_OPTIONS = {
		CONTESTAR:'Contestar',
		IGNORAR:'Ignorar',
		SI:'Si', 
		NO:'No',
		ACEPTAR: 'Aceptar',
		CANCELAR: 'Cancelar',
	}

	public static PLACEHOLDER_MSG = {		
		NEW_USER : 'INGRESE DNI'
	}


	public static MSG = {

		EXIT : 'Apretá otra vez para salir de URG Móvil.',
		EXIT_VC : 'Apretá otra vez para salir de la video consulta.',
		DISCONNECTED : 'Problemas con Internet. Revisá tu conexión para poder visualizar tus datos actualizados.',
		RECONNECTED : 'Se ha restablecido la conexión a Internet.',
		HISTORIAL_EMPTY : 'No pudimos recuperar tu historial o aún no se ha ingresado ningún registro.',
		LOGIN_ERROR_DNI : 'El DNI no se encuentra registrado.',
		LOGIN_ERROR_BLOCKED : 'Comunicate con nosotros para habilitar la registración.',
		REGISTER_OK : 'Su registración ha sido realizada con éxito.',
		REGISTER_ERROR_INCORRECT : 'La respuesta es incorrecta.',
 		REGISTER_ERROR_INCORRECT_2 : '. Comunicate con nosotros para habilitar la registración al {}.',
		TIMEOUT_ERROR: 'Lo sentimos. No podemos procesar tu solicitud en este momento. Por favor, intentá nuevamente más tarde o comunicate al 0800-444-3511',
		ADD_USER_ERROR : 'El usuario ya se encuentra registrado',
		CONNECTION_ERROR : 'Lo sentimos. No podemos procesar tu solicitud en este momento. Por favor, intentá nuevamente más tarde.',
		ERROR : 'Lo sentimos, ha ocurrido un error.',
		SORRY : 'Lo sentimos',
		TITULAR_EXIST_INFO: 'El DNI {} se encuentra registrado en esta aplicación. Si continúa con el proceso los datos relacionados con el mismo serán reemplazados. ¿Desea continuar?',
		VIDEO_CALL: 'Nueva Video Consulta en Espera',
		WRONG_NUMBER_ERROR : 'La suma del prefijo y el número de telefono debe ser de 10 caracteres',	
		WRONG_EMAIL_ERROR : 'Por favor verifique lo escrito y reingrese un email con formato válido',
		SOLICITUD_VC_ERROR: "No es posible utilizar el servicio de Video Consulta en este momento. Comunicate con nosotros de la manera tradicional.",
		ALERT_CLEANER : 'Se va a eliminar la alerta. ¿Desea continuar?',
		DATA_SAVED: 'Los datos han sido guardados',
	}

}

Config.getEnv();

function getAuthBody() {
	const client_id = 'urg_ClientIdEasyDoc'
	const client_secret = 'urg_ClientSecretEasyDoc'
	const grant_type = 'client_credentials'
	return `client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}`
}

