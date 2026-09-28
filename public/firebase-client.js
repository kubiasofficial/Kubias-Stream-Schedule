import {firebaseConfig} from './firebase-config.js';
export async function connect() {
 if (!firebaseConfig?.projectId) return null;
 const base='https://www.gstatic.com/firebasejs/12.19.0/';
 const [app,fs,auth]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-firestore.js'),import(base+'firebase-auth.js')]);
 const instance=app.initializeApp(firebaseConfig);
 return {fs,auth,db:fs.getFirestore(instance),account:auth.getAuth(instance)};
}
