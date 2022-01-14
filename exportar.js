//https://stackoverflow.com/questions/27375908/crypto-js-read-and-decrypt-file

const fs = require('fs')
const CryptoJS = require('crypto-js'); 
const Database = require('better-sqlite3');
var banco="D:\\onedrive_acad\\OneDrive - acad.ifma.edu.br\\codigos\\bancodedados\\sistemagestaonotas\\sistema_notas.db"
var dir=".\\site\\json\\"
 
const db = new Database(banco, { verbose: console.log });
const stmt = db.prepare('SELECT * FROM alunodisciplina join disciplina on alunodisciplina.disciplina_id=disciplina.id_suap where disciplina.active=?');
const query = stmt.all( '1');

var aesOptions = {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
};

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

function getInformacoes(){
    var info={};
    info['notas']=getNotasEtapas(query[id]);
    info['nome']=query[id]['nome'];
    info['id']=query[id]['id_suap'];
    return info;
}
var results={};
for (var id in query){

    var aluno=query[id]['aluno_id'];
    var disciplina=query[id]['id_suap'];
    if (results[aluno] ===  undefined){
        results[aluno]={}
    }
    results[aluno][disciplina]={}
    results[aluno][disciplina]=getInformacoes(query[id]);
}

function writefiles(matricula,data){
    var json=""+JSON.stringify(data);
    var filename=CryptoJS.MD5(matricula);

    var filecontent= CryptoJS.AES.encrypt(json,matricula).toString();
    console.log(filecontent);
    fs.writeFileSync(`${dir}${filename}.json`, filecontent);

    teste=CryptoJS.AES.decrypt(filecontent,matricula)
    console.log(teste.toString( CryptoJS.enc.Utf8 ));
}

for (var matricula in results){
    console.log(matricula); 
    writefiles(matricula,results[matricula]);
}

 