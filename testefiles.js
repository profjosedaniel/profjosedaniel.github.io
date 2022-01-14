const fs = require('fs')
const CryptoJS = require('crypto-js'); 
const Database = require('better-sqlite3');
results=['20181INFI_PINHE0055'];
var aesOptions = {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
};


for (var id in results){
    matricula=results[id];
    console.log(matricula); 
    var filename=CryptoJS.MD5(matricula);
    var data = fs.readFileSync(`./json/${filename}.json`, 'utf8');
    
    data2=CryptoJS.enc.Base64.parse(data);
    console.log(data2); 
    jsondecode= CryptoJS.AES.decrypt(data,matricula); 
    console.log("===============");
    console.log(jsondecode.toString( CryptoJS.enc.Utf8 ));

}
