const functions = require('firebase-functions');
const app = require('./server');

// Expose Express app as a Single Cloud Function named 'api'
exports.api = functions.https.onRequest(app);
