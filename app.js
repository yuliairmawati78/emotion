import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, deleteDoc, 
  doc, query, where 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxRNXTauqOB3X0FptQPeR7jkBy0gKUS3E",
  authDomain: "emotion-74f3c.firebaseapp.com",
  projectId: "emotion-74f3c",
  storageBucket: "emotion-74f3c.firebasestorage.app",
  messagingSenderId: "740825781548",
  appId: "1:740825781548:web:90d4e448d440a953440889"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_USERNAME = "mylovelybee";
const ADMIN_PASSWORD = "byblublia372";

let currentUser = null;
let currentRole = null;
let selectedId = null;
let bubbles = [];

const colors={
1:"#C8F7DC",
2:"#A8D8FF",
3:"#FFF3B0",
4:"#FFCC9A",
5:"#FF9E9E",
6:"#C3A6FF"
};

//////////////////////////////
// 🔐 OPEN LOGIN
//////////////////////////////
window.openLogin = function(){
document.getElementById("loginModal").style.display="flex";
};

//////////////////////////////
// 🔐 LOGIN SYSTEM
//////////////////////////////
window.login = async function(){

const username = document.getElementById("username").value;
const password = document.getElementById("password").value;

// ADMIN
if(username===ADMIN_USERNAME && password===ADMIN_PASSWORD){
currentUser=username;
currentRole="admin";
alert("Login sebagai Admin 👑");
}
else{
// USER
const q=query(collection(db,"users"),
where("username","==",username),
where("password","==",password)
);
const snap=await getDocs(q);

if(snap.empty){
alert("Username atau password salah!");
return;
}

currentUser=username;
currentRole="user";
alert("Login sebagai User ✨");
}

document.getElementById("loginModal").style.display="none";
updateMenu();
loadNotes();
};

//////////////////////////////
// 🧭 UPDATE MENU
//////////////////////////////
function updateMenu(){
const menu=document.getElementById("menuLeft");

if(currentRole==="admin"){
menu.innerHTML=`<button onclick="openForm()">Tambah Catatan</button>`;
}
else if(currentRole==="user"){
menu.innerHTML=`<button onclick="openForm()">Tambah Catatan</button>`;
}
}

//////////////////////////////
// 📝 FORM
//////////////////////////////
window.openForm=function(){
if(!currentUser) return alert("Login dulu!");
document.getElementById("formModal").style.display="flex";
};

window.closeForm=function(){
document.getElementById("formModal").style.display="none";
};

window.saveNote=async function(){

const note={
tanggal:document.getElementById("tanggal").value,
username:currentUser,
judul:document.getElementById("judul").value,
isi:document.getElementById("isi").value,
level:parseInt(document.getElementById("level").value),
kategori:document.getElementById("kategori").value,
createdAt:new Date()
};

await addDoc(collection(db,"notes"),note);

closeForm();
loadNotes();
};

//////////////////////////////
// 📦 LOAD NOTES (AUTO SAAT WEB DIBUKA)
//////////////////////////////
async function loadNotes(){

bubbles.forEach(b=>b.el.remove());
bubbles=[];

let q;

if(currentRole==="admin"){
q=collection(db,"notes");
}
else if(currentRole==="user"){
q=query(collection(db,"notes"),
where("username","==",currentUser));
}
else{
// BELUM LOGIN → TAMPILKAN SEMUA CATATAN
q=collection(db,"notes");
}

const snap=await getDocs(q);

snap.forEach(docSnap=>{
createBubble(docSnap.data(),docSnap.id);
});
}

//////////////////////////////
// 🫧 CREATE BUBBLE
//////////////////////////////
function createBubble(note,id){

const size=90+note.level*10;
const el=document.createElement("div");
el.className="bubble";
el.style.width=size+"px";
el.style.height=size+"px";
el.style.background=colors[note.level];
el.innerHTML=note.judul;

document.body.appendChild(el);

let bubble={
el,id,note,
x:Math.random()*(window.innerWidth-size),
y:Math.random()*(window.innerHeight-size),
dx:(Math.random()*2+1)*(Math.random()>.5?1:-1),
dy:(Math.random()*2+1)*(Math.random()>.5?1:-1),
size
};

el.style.left=bubble.x+"px";
el.style.top=bubble.y+"px";

el.onclick=function(){
selectedId=id;
document.getElementById("dJudul").innerText=note.judul;
document.getElementById("dTanggal").innerText=note.tanggal;
document.getElementById("dUser").innerText="By: "+note.username;
document.getElementById("dKategori").innerText=note.kategori;
document.getElementById("dIsi").innerText=note.isi;
document.getElementById("detailCard").style.background=colors[note.level];
document.getElementById("detailModal").style.display="flex";
};

bubbles.push(bubble);
}

//////////////////////////////
// ❌ DELETE (ADMIN ONLY)
//////////////////////////////
window.deleteNote=async function(){
if(currentRole!=="admin") return alert("Hanya admin yang bisa hapus!");
await deleteDoc(doc(db,"notes",selectedId));
closeDetail();
loadNotes();
};

window.closeDetail=function(){
document.getElementById("detailModal").style.display="none";
};

//////////////////////////////
// 🎯 ANIMATION
//////////////////////////////
function animate(){
for(let i=0;i<bubbles.length;i++){
let b=bubbles[i];
b.x+=b.dx;
b.y+=b.dy;

if(b.x<=0||b.x+b.size>=window.innerWidth) b.dx*=-1;
if(b.y<=0||b.y+b.size>=window.innerHeight) b.dy*=-1;

for(let j=i+1;j<bubbles.length;j++){
let b2=bubbles[j];
let dx=b.x-b2.x;
let dy=b.y-b2.y;
let dist=Math.sqrt(dx*dx+dy*dy);
if(dist<b.size/2+b2.size/2){
[b.dx,b2.dx]=[b2.dx,b.dx];
[b.dy,b2.dy]=[b2.dy,b.dy];
}
}

b.el.style.left=b.x+"px";
b.el.style.top=b.y+"px";
}
requestAnimationFrame(animate);
}

// 🔥 LOAD SAAT PERTAMA BUKA WEB
loadNotes();
animate();
