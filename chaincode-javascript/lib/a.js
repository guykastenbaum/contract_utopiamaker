var x = Date.parse("12-01-2023");
//var x = "2"

console.log(x)
console.log(Date.now())


var validRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
var st1 = "ia@exco";
var st2 = ""
console.log(st1.toLocaleLowerCase().match(validRegex) !== null)
console.log(st2.toLocaleLowerCase().match(validRegex) !== null)

const regexExp = /^[a-f0-9]{64}$/gi;

// String with SHA256 hash
const str = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";

console.log(regexExp.test(str));