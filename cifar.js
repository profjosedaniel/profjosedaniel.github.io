const CryptoJS = require('crypto-js'); 
// var hash = CryptoJS.SHA256("Message");
// console.log( hash );


var encrypted = CryptoJS.AES.encrypt("Message", "Secret Passphrase");
console.log(encrypted.toString())