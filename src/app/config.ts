export class Config {

	public static OPTIONS = {
		SERVER : 'gabi',
		EXPIRE_TIME : 30 * 24 * 60, // login expire time, in minutes
		REQUEST_TIMEOUT : 4000, // for some backend requests, in milliseconds		
		NOTI_SIM_DELAY : 0, //notification simulation delay, in seconds (0: disable simulation)
		ONE_SIGNAL_APP_ID : '6222cb3a-8180-4242-971c-86a4baa23529',
		GOOGLE_PROJECT_NUMBER : '367741538862',
		ONE_SIGNAL_APP_ID_TEST : '99b9131f-cfa9-4b3a-ab12-2d0d459c9916',
		GOOGLE_PROJECT_NUMBER_TEST : '981462568601',
		VERSION_NUMBER : '1.0.5',
	}

	static SERVERS = {
		new : 'https://urgencias-producto.appspot.com/api',
		old : 'https://easydocbackend.appspot.com',
		test : 'https://test-easydoc-backend.appspot.com',
		//sacar cuando tengamos ambiente de test
		gabi : 'http://172.16.1.6:8080/api',
		cari : 'http://172.16.1.36:8080/api'
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
	}

	public static SERVER_URL = getServerURL()

	public static authBody = getAuthBody()

	public static KEY = {
		TITULAR : 'titular',
		ACTIVE : 'active',
		EXPIRES : 'expires',
		USERS : 'users',
		HISTORIAL : 'historial',
		MIS_DATOS : 'misDatos',
		TELEFONOS : 'telefonos',
		ALERTAS : 'alertas',
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
		REGISTER_ERROR_INCORRECT_2 : 'La respuesta es incorrecta. Comunicate con nosotros para habilitar la registración.',
		ADD_USER_ERROR : 'El usuario ya se encuentra registrado',
		CONNECTION_ERROR : 'Lo sentimos. No podemos procesar tu solicitud en este momento. Por favor, intentá nuevamente más tarde.',
		ERROR : 'Lo sentimos, ha ocurrido un error.',
		SORRY : 'Lo sentimos',
	}

}


function getServerURL() {
	return Config.SERVERS[Config.OPTIONS.SERVER]
}

function getAuthBody() {
	const client_id = 'urg_ClientIdEasyDoc'
	const client_secret = 'urg_ClientSecretEasyDoc'
	const grant_type = 'client_credentials'
	return `client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}`
}
