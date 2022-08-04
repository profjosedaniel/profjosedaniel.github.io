//https://stackoverflow.com/questions/27375908/crypto-js-read-and-decrypt-file

const fs = require('fs')
const CryptoJS = require('crypto-js'); 
const Database = require('better-sqlite3');
var banco="D:\\onedrive_acad\\OneDrive - acad.ifma.edu.br\\codigos\\bancodedados\\sistemagestaonotas\\sistema_notas.db"
var dir=".\\site\\json\\"
tem={ verbose: console.log }
const db = new Database(banco ,{});

var aesOptions = {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
};

function show(aluno,results,info){
    if(aluno=='20191ADMI_PINHE0012'){
        console.log(">>>>>",info);
        console.log(aluno);
        console.log(results);
    }
}

function getNota(aluno,results){
const stmt = db.prepare(`
SELECT *
FROM atividadenota        
join atividade 
on atividade.id = atividadenota.atividade_id
where atividadenota.aluno_id=?
`);
 
    const query222 = stmt.all(aluno);
    for (var id in query222){
        var n=query222[id];
        var atividade=n['atividade_id'];
        var numero=n['numero'];
        var disciplina=n['disciplina_id'];
        var nota=n['nota'];
        var feedback=n['feedback'];
        

        if (results[disciplina] === undefined){continue;}
            
        if (results[disciplina][atividade] === undefined){continue;}
        
        if (nota === undefined || nota=='' || nota ==='' ){
            nota='?';
        }
        var atv=Object.assign({},results[disciplina][atividade]);
        atv['aluno']=aluno;
        atv['nota']=nota;
        atv['feedback']=feedback;
        results[disciplina][atividade]=atv

      
      if(aluno=='20191ADMI_PINHE0012'){
        console.log(disciplina,atividade,numero,nota);
        show(aluno,JSON.stringify(results[disciplina]),"antes");
      }
    }
    return results
}

function getAtividades(){
    const stmt = db.prepare(`SELECT atividade.* FROM atividade join disciplina on disciplina.id_suap= atividade.disciplina_id where disciplina.active = 1`);
    const query= stmt.all();
    var disciplinas={};
    for (var d in query){
        var disciplina=query[d]['disciplina_id'];
        var id=query[d]['id'];
        var nome=query[d]['nome'];
        var peso=query[d]['peso'];
        var bimestre=query[d]['bimestre'];
        var numero=query[d]['numero'];
        var enunciado=query[d]['enunciado'];
        var atividade={'id':id,'nome':nome,'peso':peso,'numero':numero,'nota':'?','feedback':'-','etapa':bimestre};//'enunciado':enunciado,
        
        if( disciplinas[disciplina] === undefined){
            disciplinas[disciplina]={};
        }
        disciplinas[disciplina][id]=atividade;
    }
    return disciplinas;
}

function getNotasEtapas(notas){
    var n1=notas['notaprovab1SUAP'];
    var n2=notas['notaprovab2SUAP'];
    var n3=notas['notaprovab3SUAP'];
    var n4=notas['notaprovab4SUAP'];
    var r1=notas['recuperacaob1SUAP'];
    var r2=notas['recuperacaob2SUAP'];
    var r3=notas['recuperacaob3SUAP'];
    var final=notas['finalSUAP'];
    return {"Etapa 1":n1,"Etapa 2":n2,"Etapa 3":n3,"Etapa 4":n4,"Recuperação Etapa 1":r1,"Recuperação Etapa 2":r2,"Recuperação Etapa 3":r3,"Final":final};
}

function getInformacoes(query){
    var info={};
    info['notas']=getNotasEtapas(query);
    info['nome']=query['nome'];
    info['etapas']=query['quantidadeBimestres'];
    info['id']=query['id_suap'];
    return info;
}

function writefiles(matricula,data){
    var json=""+JSON.stringify(data);
    var filename=CryptoJS.MD5(matricula);
 
    show(matricula,json);
    var filecontent= CryptoJS.AES.encrypt(json,matricula).toString();

    fs.writeFileSync(`${dir}${filename}.json`, filecontent);
    fs.writeFileSync(`${dir}${matricula}.json`, json);

 var   teste=CryptoJS.AES.decrypt(filecontent,matricula)
 //   console.log(teste.toString( CryptoJS.enc.Utf8 ));
}

function process_exports(results){
    for (var matricula in results){    
        writefiles(matricula,results[matricula]);
    }
}

function info_nota(etapa,nota,recuperacao){
    console.log("|||||||||||")
    console.log(nota,recuperacao)
    if(nota!=undefined && parseFloat(nota)<7 ){
        if(recuperacao==undefined || parseFloat(recuperacao)<1){
            return true
        }
    }
    return false
}
function colocar_observacoes(disciplina){
    
    console.log(disciplina);
    var etapas=[];
    for(var etapa=1; etapa< disciplina['etapas'];etapa++){
        if(info_nota(etapa,disciplina['notas'][`Etapa ${etapa}`],disciplina['notas'][`Recuperação Etapa ${etapa}`])){
            etapas.push(etapa)
        }
    }
    if(etapas.length==0){
        return ""
    }else if(etapas.length==1){
        var etapa=etapas[0]
        return `Você tirou uma nota inferior a 7 na etapa ${etapa} por isso você deve fazer atividade de recuperação dessa etapa.`
        
    }else{
        return `Você tirou uma nota inferior a 7 nas seguintes etapas ${etapas} por isso você deve fazer atividade de recuperação das etapas citadas.`
        
    }
}

function process_load_notas(){
    const stmt = db.prepare("SELECT * FROM alunodisciplina join disciplina on alunodisciplina.disciplina_id=disciplina.id_suap where disciplina.active=?");
    const query = stmt.all( '1');

    var results={};
    var disciplina=[];
    var atividades=getAtividades();
    for (var id in query){
        var aluno=query[id]['aluno_id'];
        var disciplina=query[id]['id_suap'];
        if (results[aluno] ===  undefined){
            results[aluno]={}
        }
        var nota_aluno=getInformacoes(query[id]);
        var info_atv=Object.assign({}, atividades[disciplina]);

        results[aluno][disciplina]=Object.assign({}, info_atv , nota_aluno);
    }

    for (var id in query){
        var aluno=query[id]['aluno_id'];
        results[aluno]=getNota(aluno,results[aluno]);
    }

    for (var id in query){
        var aluno=query[id]['aluno_id'];
        for (var id in results[aluno]){           
            var observacao=colocar_observacoes(results[aluno][id]);
            results[aluno][id]['observacao']=observacao;
        }
    }

    return results;
}

var notas=process_load_notas();
process_exports(notas);
console.log('----------')
console.log(JSON.stringify(notas))
// nota=getNota('5','20181INFI_PINHE0035');
// console.log(process_load_notas());
// console.log(getAtividades());
