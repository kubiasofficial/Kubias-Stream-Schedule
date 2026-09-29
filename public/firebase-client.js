import {firebaseConfig} from './firebase-config.js';
let main,visitor;
async function create(name) {
 if (!firebaseConfig?.projectId) return null;
 const base='https://www.gstatic.com/firebasejs/12.19.0/';
 const [app,fs,auth]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-firestore.js'),import(base+'firebase-auth.js')]);
 const instance=app.initializeApp(firebaseConfig,name);
 return {fs,auth,db:fs.getFirestore(instance),account:auth.getAuth(instance)};
}
export const connect=()=>main??=create('[DEFAULT]');
// Oddelena identita navstevnika nesdili prihlaseni spravce.
export const connectVisitor=()=>visitor??=create('kubias-visitor');
