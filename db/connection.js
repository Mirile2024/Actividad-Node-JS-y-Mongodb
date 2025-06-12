process.loadEnvFile();
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.mongodb_uri);

async function connect() {
    try {
        await client.connect();
        console.log('Conectado a la base de datos');
        return client;
    } catch (error) {
        console.log(error);
        return null;
    }
}
async function disconnect() {
    try {
        await client.close();
        console.log('Desconectado de la base de datos');
    } catch (error) {
        console.log(error);
    }
}
module.exports = { connect, disconnect };   