const fb = require("firebase/app");
const fdb = require("firebase/firestore")

const firebaseConfig = {
    apiKey: "AIzaSyA2UWh17YyktnC7i_DWbvkWxgHt6HQzF98",
    authDomain: "devslog-97116.firebaseapp.com",
    projectId: "devslog-97116",
    storageBucket: "devslog-97116.appspot.com",
    messagingSenderId: "220123085362",
    appId: "1:220123085362:web:d55f7f3d0c776b58be9a2b",
    measurementId: "G-FNNMDMCPY0"
};

const app = fb.initializeApp(firebaseConfig);
const db = fdb.getFirestore(app);

module.exports = { fdb, db }