//INFO: vars globales, inicializa, libreria, etc.

GLOBAL= window; //U: para acceder a todo lo definido

/************************************************************************** */
//S: utiles
function fLog(msg,fToCallAfter) { //U: devuelve una funcion, que al llamarla loguea mensaje y los parametros
	return function (p1,p2) { console.log(msg,p1,p1); }
}

function fAppGoTo(link) { //U: una funcion para ir a un link que se puede poner en onClick
	return function () { appGoTo(link); }
}

function paramsToTypeKv() { //U: devuelve un kv con los params separados por tipo
	var r= {};
	for (var i=0;i<arguments.length;i++) { var v= arguments[i];
		if (typeof(v)=="function") { r.f= v; }
		else if (Array.isArray(v)) { r.array= v; }
		else if (typeof(v)=="object") { r.kv= v; }
		else { r.txt= v; }
	}
	r.kv= r.kv || {};
	return r;
}


/************************************************************************** */
//S: UI: pReact + Router + Semantic UI
Routes= { //U: RUTAS DE PREACT ROUTE, las usa la pantalla principal
}

var { Component, h, render } = window.preact;
var { Accordion, Card, Divider, Responsive, Grid, Table, Dropdown ,Label ,Select ,Header, Icon, Image, Menu, Segment, Sidebar, Modal, Button, Input, List, Item, Container, Form, Message }= window.semanticUIReact; //U: para acceder directamente ej. con h(Button ....)
var Cmp= window.semanticUIReact; //U: para acceder con Cmp.Button, a todos de una (MEJOR)

render_str= preactRenderToString; //U: genera el html para un componente

function CmpDef(f, proto) { //U: definir un componente de UI que se puede usar como los otros de pReact+Semantic ej. Button, le pasa una variable "my" como parametro a "f" ej. para hacer "my.render= ..."
	proto= proto || Component;
	f= f || function () {};

	var myComponentDef= function (...args) {
		var my= this; 
		proto.apply(my,args);  //A: initialize with parent
		f.apply(my,[my].concat(args));
		//A: llamamos la funcion que define el componente con la instancia
	}

	var p= myComponentDef.prototype= new proto(); 

	p.toProp= function (name) {	//U: para usar con onChange u onInput
		return (e) => { this[name]= e.target.value; } 
	}
	p.refresh= function (kv) { this.setState(kv || {}); } //U: redibujar 

	return myComponentDef;
}

Cmp.NA= () => h('div',{},'UiNA:NOT IMPLEMENTED'); //U: para usar donde todavia no implementaste

Cmp.Main= CmpDef(function CmpMain(my) { //U: el que inicia todo, usa las rutas para tus pantallas
  my.componentWillMount = function () {
    var body = document.getElementsByTagName('body')[0];
    body.style.backgroundColor =  LAYOUT.BG_COLOR;
 		//A: cambie el color del fondo 
 }
 
	my.render= function (props, state) {
		return (
			h('div', {id:'app'},
				//VER: https://github.com/preactjs/preact-router
				h(preactRouter.Router, {history: History.createHashHistory()},
					Object.entries(Routes).map( ([k,v]) => {
						var cmp= typeof(v.cmp)=="function" ? v.cmp : Cmp[v.cmp]; //A: si es string, buscar en definidos
						if (cmp==null) { console.error("Route "+k+" component not defined "+v.cmp); }
						return h(cmp, {path: k, ...v}); //A: el comoponente para esta ruta
					}),
				), //A: la parte de la app que controla el router
			)
		);
	}
});

function CmpDefAuto() { //U: para todas las definiciones tipo function cmp_MiPantalla te genera Cmp.MiPantalla, asi podes definir pantallas con solo definir funciones
	var k; for (k in GLOBAL) {
		if (typeof(GLOBAL[k])=="function") {
			var m;
			if (m= k.match(/^cmp_(.*)/)) { //A: es una funcion que define un componente
				Cmp[m[1]]= CmpDef(GLOBAL[k]); //A: defino el componente
			}
			else if (m= k.match(/^scr_(.*)/)) { //A: es una funcion que define una pantalla, puede ser scr_factura_$fecha_$cliente y tener params!
				Cmp[k]= CmpDef(GLOBAL[k]); //A: defino el componente, mismo nombre que funcion
				var parts= k.replace("$",":").split("_"); parts.shift(); //A: las partes, menos scr, con : como usa el router para las variables
				var route= parts.join("/");
				Routes[route]= Routes[route] || {};
				Routes[route].cmp= k;
				//A: agregue la ruta si no estaba, actualice el componente que dibuja esa pantalla
			}
		}
	}
}

function eAct() { //U: un elemento accionable tipo boton
	var d= paramsToTypeKv.apply(null,arguments);	
	d.kv.children= d.array || (d.txt && [d.txt]);
	d.kv.onClick= d.f;
	return h(d.kv.cmp || Button, d.kv);
}

function eOut() { //U: elemento de salida tipo div
	var d= paramsToTypeKv.apply(null,arguments);	
	d.kv.children= d.array || (d.txt && [d.txt]);
	d.kv.onClick= d.f;
	return h(d.kv.cmp || 'div', d.kv);
}

function eGroup() { //U: array con grupo de elementos
	var d= paramsToTypeKv.apply(null,arguments);	
	d.kv.children= d.array || (d.txt && [d.txt]);
	return h(d.kv.cmp || 'div', d.kv);
}

function e() { //U: elemento "si adivina" que tipo
	var d= paramsToTypeKv.apply(null,arguments);	
	d.kv.children= d.array || (d.txt && [d.txt]);
	console.log("PEPE",d);
	return h(d.kv.cmp || d.f, d.kv.cmp ? d.kv: {children: d.kv.children});
}


function AppStart(theme) { //U: inicia la app!
	UiSetTheme(theme || 'chubby');
	CmpDefAuto();
	render(h(Cmp.Main), document.body);
}

function appGoTo(route) { //U: navega a una ruta
	if (Routes[route]==null) { console.error("Route "+route+" not defined, AppGo"); }
	preactRouter.route(route);
}

/************************************************************************** */
//S: colores y formatos UI
var UiThemes= "cerulean chubby cosmo cyborg darkly flatly journal lumen paper readable sandstone simplex slate solar spacelab superhero united yeti".split(' '); //U: vienen preinstalados!

function UiSetTheme(nombre) { //U: activar este tema de ui (colores, tamaños, etc.)
  var st= document.getElementById("tema");
  st.href='/node_modules/semantic-ui-forest-themes/semantic.'+nombre+'.min.css';
}

COLOR= { } //U: para definir colores por nombre o funcion, ej. "FONDO" y poder cambiarlos
COLOR.azulOscuro= 'rgb(56,87,162)';
COLOR.azulClaro= 'rgb(105,178,226)';
COLOR.gris= 'rgb(194,195,201)';

LAYOUT= { //U: para poder definir directamente CSS y cambiarlo desde cfg
	BG_COLOR : COLOR.gris //U: el fondo la pagina para el sitio 
}

VIDEO_ICON_URL= '/ui/imagenes/video_play.png'

/************************************************************************** */
//S: server and files cfg
Server_url= location.href.match(/(https?:\/\/[^\/]+)/)[0]; //A: tomar protocolo, servidor y puerto de donde esta esta pagina
Api_url= Server_url+'/api'; //U: la base de la URL donde atiende el servidor

var Auth_usr= ''; //U: que ingreso en el form login, se pueden usar ej. para acceder a server
var Auth_pass= '';

function auth_save() { //U: guardar usuario y pass ej. para recuperar si entra de nuevo o reload, NOTAR que solo se accede desde esta url, el store es "mas o menos" seguro
	localStorage.setItem('usuario', Auth_usr);
	localStorage.setItem('password', Auth_pass);
}

function auth_load() { //U: recuperar usuario y pass si se guardaron
	if (!Auth_usr){
		Auth_usr = localStorage.getItem('usuario');
		Auth_pass = localStorage.getItem('password');
	}
	return Auth_usr;
}

function auth_token() { //U: genera un token unico para autenticarse con el servidor ej. para cuando queres acceder directo a la url de una imagen o archivo para download desde un link
  var salt= Math.floor((Math.random() * 10000000)).toString(16).substr(0,4);
  var token= salt+CryptoJS.SHA256(salt + Auth_usr + Auth_pass).toString(); //TODO: defenir stringHash() como en el server //TODO: EXPIRAR el token!!!
  return token;
}

async function FetchUrl(url, usuario, password, quiereJsonParseado, data, method){ //U: hacer una peticion GET y recibir un JSON
  let response= await fetch(url,{
		method: method || 'GET', //U: puede ser POST
    headers: new Headers({
      'Authorization': 'Basic '+btoa(`${usuario}:${password}`), 
      'Content-Type': 'application/json',
    }),
		body: data!=null ? JSON.stringify(data): null,
  })
  if(quiereJsonParseado=="text") { return await response.text(); }
	else if (quiereJsonParseado) { return await response.json(); }

  return response;
}

async function GetUrl(url,quiereJsonParseado, data) {
	return FetchUrl(url, Auth_usr, Auth_pass, quiereJsonParseado, data);
}

async function PostUrl(url, quiereJsonParseado, data) {
	return FetchUrl(url, Auth_usr, Auth_pass, quiereJsonParseado, data, 'POST');
}


/************************************************************************** */
//S: Util

CopyToClipboardEl= null; //U: el elemento donde ponemos texto para copiar
function copyToClipboard(texto) { //U: pone texto en el clipboard
	if (CopyToClipboardEl==null) {
		CopyToClipboardEl= document.createElement("textarea");   	
		CopyToClipboardEl.style.height="0px"; 
		CopyToClipboardEl.style.position= "fixed"; 
		CopyToClipboardEl.style.bottom= "0"; 
		CopyToClipboardEl.style.left= "0"; 
		document.body.append(CopyToClipboardEl);
	}
	CopyToClipboardEl.value= texto;	
	CopyToClipboardEl.textContent= texto;	
	CopyToClipboardEl.select();
	console.log("COPY "+document.execCommand('copy')); 
	document.getSelection().removeAllRanges();
}

/******************************************************************************/
//S: QR, generar imagen

function QR(str) { //U: genera un objeto QR para generar distintos formatos de grafico para la str recibida como parametro
  var typeNumber = 10; //U: cuantos datos entran VS que calidad requiere, con 10 y las tabletas baratas de VRN escaneando monitor laptop funciona ok, entran mas de 150 bytes
  var errorCorrectionLevel = 'L'; //U: mas alto el nivel de correcion, menos fallas pero menos datos, con L funciona ok
  var qr= qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(str);
  qr.make();
  return qr
}

function QRGenerarTag(str) { //U: devuelve un tag html "img" con el QR para str
  return QR(str).createImgTag();
}

function QRGenerarData(str) { //U: devuelve la data url para usar en un tag img con el QR para str
	return QR(str).createDataURL();
}

/************************************************************************** */
//S
function JSONtoDATE(JSONdate) {  //U: recibe una fecha en formato json y devuelve un string con la fecha dia/mes/anio
	let fecha = new Date(JSONdate);
	if (isNaN(fecha)) return 'error en fecha'
	return  [fecha.getDate(), fecha.getMonth()+1, fecha.getFullYear()].map(n => (n+'').padStart(2,"0")).join("/");
	//A: ojo, Enero es el mes CERO para getMonth
}

function JSONtoHour(JSONdate) {
	let date = new Date(JSONdate);
	return [date.getHours(), date.getMinutes()].map(n => (n+'').padStart(2,"0")).join(":");
}             



