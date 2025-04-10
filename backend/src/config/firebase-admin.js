const admin = require('firebase-admin');
const path = require('path');

// Путь к сервисному ключу
const serviceAccount = require(path.join(__dirname, '../../keys/firebase-admin-key.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://brainmeal-9923f.firebaseio.com"
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth }; 