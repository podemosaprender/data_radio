//INFO: punto de entrada de la parte que se ejecuta en la web

//------------------------------------------------------------
//S: mover a lib
//------------------------------------------------------------
function cmp_cnt(my) {
	var cnt= 0;
	function inc() { cnt++; my.refresh(); }
	function dec() { cnt--; my.refresh(); }

	my.render= function() {
		return eGroup([ 
			eOut(cnt),
			eAct('+',inc),
			eAct('menos',dec,{cmp: 'a', style: { border: '2px dotted gray'}})
		]);
	}
}

function scr_home(my){ //U: pantalla principal cuando ya te logueaste
	my.render= function () { 
		return eGroup([
			'Hola PodemosAprender!',
			eAct('radio!', fAppGoTo('/radio')),
			e(Cmp.cnt), e(Cmp.cnt),
		]);
	}
}

function cmp_audio(my) { //U: un componente para reproducir audio
	my.render= function cmp_audio_render(props) {
		//eventos interesates onEnded: fLog("ended"), onLoadedmetadata: fLog("load")
		//SEE: https://www.w3schools.com/tags/ref_av_dom.asp
		return e({cmp: 'audio',controls: true, ... props}, [
				e({cmp:'source',src: props.src , type: "audio/ogg"})
		]);
	}
}

RADIO_URL="https://www.podemosaprender.org/data_radio/";
RadioIdx= null; //DFLT
function radioFecth(wantsReload) {
	if (RadioIdx && !wantsReload) { return new Promise(cb => cb(RadioIdx)) }
	//A: si ya lo tenia, lo devolvi, sino lo busco
	return fetch(RADIO_URL+'programas.html?x='+Date.now())
		.then(r => r.text())
		.then(t => { 
			RadioIdx= {}; 
			console.log("El texto que traje es "+t);
			t.match(/<p>[^<]*/g) //A: array con todas las entradas desde <p>hasta<
			.sort()
			.forEach( f => {
				var parts= f.split("/"); parts.shift(); //A: tiro <p>.
				if (parts[1].match(/.ogg/)) { return } //A: no quiero los audios de entrada y salida
				var programa= RadioIdx[parts[1]] || {titulo: parts[1], audios: []};
				RadioIdx[parts[1]]= programa; //A: seguro lo guarde e inicialice
				programa.audios.push(RADIO_URL+'/'+parts.join('/'));
			});
			return RadioIdx;
		});
}

function scr_radio_$programa(my) { //U: escuchar la radio, un programa, radio/miprograma
	var wantsPlay= false;
	var audios= null;
	var audioIdx= 0;
	var audioDone= false;
	var indexLoaded= false;

	function audioOnLoadedMetadata(e) {
		wantsPlay= true;
		//audioDuration: e.target.duration, 
		//TODO: no puedo cambiar estado en este evento porque vuelve a hacer render, y elemento de audio pierde estado, carga de nuevo, etc.
	}

	function audioOnEnded() {
		if (audioIdx<audios.length-1) { audioIdx++; }
		else { audioDone= true; }
		my.refresh(); //A: redibujar
	}

	function volverAEscuchar() {
		wantsPlay= true;
		audioIdx= 0; audioDone= false;
		my.refresh();
	}

	my.componentWillMount= function () {
		radioFecth()
			.then(() => {indexLoaded= true; my.refresh() }); //A: cargue lista de programas
	}

	my.render= function (props, state) { 
		audioIdx= audioIdx || 0; 
		programa= props.matches.programa;
		audios= RadioIdx && RadioIdx[programa] && RadioIdx[programa].audios
		console.log("Radio programa="+programa+" audios="+audios);

		return h('div',{},
			h('h1',{},'Radio PodemosAprender'),
			h('h2',{},programa),
			indexLoaded 
				? audioDone 
					? eAct(volverAEscuchar,'Volver a escuchar') 
					: eGroup([
							h('h4',{},"(" + audioIdx + "/" + audios.length+") "+audios[audioIdx]),
							h(Cmp.audio,{src: audios[audioIdx], onEnded: audioOnEnded, onLoadedmetadata: audioOnLoadedMetadata, autoplay: wantsPlay}),
							h('div',{},
								h(Button,{onClick: audioOnEnded},'Próximo') 
							)
						])
				: 'Cargando programa '+programa,
			eAct(fAppGoTo('/radio'),'Volver a la lista')
		);
	}
}

function scr_radio(my) { //U: escuchar la radio, ver programas
	var indexLoaded= false;

	my.componentWillMount= function () {
		radioFecth()
			.then(() => {indexLoaded= true; my.refresh()}); //A: cargue lista de programas
	}

	my.render= function (props, state) { 
		var eProgramas= 'Cargando programas ...'; //DFLT: lista de programas
		if (indexLoaded) {
			eProgramas= Object.keys(RadioIdx).sort().map( k => eAct(k,fAppGoTo('/radio/'+k),{style: {display: 'block', margin: '5px'}}) )
		}

		return eGroup([
			h('h1',{},'Radio PodemosAprender'),
			eProgramas
		]);
	}

}

function scr_login(my){ //U: formulario de ingreso 
  var tecleando= (e, { name, value }) => my.setState({[name]: value});
	toState= (k) => { return { name: k, value: my.state[k], onChange: tecleando} };

  var enviarFormulario= () => {
    Auth_usr= my.state.nombre.trim();
    Auth_pass= my.state.password.trim();

    if(Auth_usr !='' && Auth_usr != null & Auth_usr != undefined){
      if(my.state.password !='' && my.state.password != null & my.state.password != undefined)
			auth_save();
      appGoTo("/home")
    }
  }

  my.render= function(){
    return (
      h(Grid,{textAlign:'center', style:{ height: '100vh' }, verticalAlign:'middle'},
        h(Grid.Column, {style: {maxWidth: 450}},
          h(Image,{style: {width: "10em", height: "10em", margin: 'auto'}, src:'./imagenes/logo.png'},), 
          h(Form, {size:'large',onSubmit: enviarFormulario },
            h(Segment,{stacked:true},
              h(Form.Input,{name: 'nombre',onChange: tecleando , fluid:true, icon:'user', iconPosition:'left', placeholder:'E-mail address',value: my.state.nombre}),
              h(Form.Input,{name: 'password', onChange: tecleando, fluid:true, icon:'lock',iconPosition:'left',placeholder:'Password',type:'password',value: my.state.password}),
              h(Button,{color:'blue', fluid:true,size:'large'},"Login")  //onClick: () =>appGoTo("/menu")
            )
          )  
        )
      )
    )
  }
}

//------------------------------------------------------------
uiMenuTopbar= CmpDef(function uiMenuTopbar(my) {//U: menu principal de la parte superior 
  my.render= function (props, state) {
    return (
      h(Menu,{item:true,stackable:true,style:{backgroundColor: 'rgb(255, 255, 255)',backgroundColor: 'rgb(48,53,66)'}},
        h('img',{src: './imagenes/logoBlanco.png',style:{width:"180px",height:'60px',"margin-top":"3px"}}),
        
        h(Menu.Menu,{position:'right'},
          h(Menu.Item,{},
            h(Icon,{name:'user',size:'big'}),
            h('p',{}, `Welcome ${Auth_usr ? Auth_usr : ''}`,)
          ),
          h(Menu.Item,{},            
            h(Button, {onClick: resetDemo},"reset"),
          ),
          h(Menu.Item,{},
            h(Button, {onClick: props.onRefresh, icon: true, labelPosition:'left',},
            h(Icon,{name:'refresh'}), 
						"Refresh" )
          )
        ),
      )
		);
  }
});

//----------------------------------------------------------
function ImageCreateLink(instancia, file){ //U: crea una url para pedir un archivo
  return `${ApiUrl}/TODO_DONDE/${file}?tk=${auth_token()}` 
}

//-----------------------------------------------------------------------------
//S: inicio
Routes["/"]= {cmp: "scr_radio"}
AppStart();
