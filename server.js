const { connect, disconnect } = require('./db/connection');
const {ObjectId} = require('mongodb');
const express = require('express');
// const { validarfrutas, validarfrutasParcialmente } = require("./schemas/frutas.js");
const app = express();
const port = process.env.port || 3000;

app.use(express.json());

app.use('/frutas', async (req, res, next) => {// conecion con la base de datos
    try {
        const cliente = await connect();
        req.db = cliente.db('FrutasDb').collection('frutas');
        next();
    } catch (error) {
        clg.error({ error });
    }
    res.on('finish', async () => {
        await disconnect();
    });
})
app.get('/', (req, res) => {//ruta raiz
    res.send('Hola mundo');
});
app.get('/frutas', async (req, res) => {//consulta todos los datos
    try {
        const frutas = await req.db.find({}).toArray();
        if (!frutas) {
            res.status(400).json({ error: 'No hay frutas' });
        }
        res.json(frutas);
    }   catch (error) {
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }
});
app.get('/frutas/:id', async(req, res) => {//consulta por _id generado por mongodb
    const {id} =req.params;
    try {
        const fruta = await req.db.findOne({ _id: new ObjectId(id) });
        if (!fruta) {
            res.status(400).json({ error: 'No hay frutas con ese ID' });
        } else{
            res.json(fruta);
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }
});
// app.get('/frutas/:id', async (req, res) => {//consulta por id generado por el usuario
//     const client = await connect();
//     const id = parseInt(req.params.id);
//     //    if(isNaN(id)){
//     //        res.status(400).json({ error: 'El id debe ser un numero' });
//     //    }
//     try {
//         const db = client.db('FrutasDb');
//         const fruta = await db.collection('frutas').findOne({ id });
//         if (!fruta) {
//             res.status(400).json({ error: 'No hay frutas con ese ID' });
//         }
//         res.json(fruta);
//     } catch (error) {
//         res.status(500).json({ error: 'Error al conectar a la base de datos' });
//     } finally {
//         disconnect();
//     }
// });

app.get('/frutas/nombre/:nombre', async (req, res) => {
    const { nombre } = req.params;
    try {
        const frutas = await req.db.find({nombre: {$regex: nombre}}).toArray();
        if (!frutas) {
            res.status(400).json({ error: 'No hay frutas' });
        }
        res.json(frutas);
    }   catch (error) {
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }
});

app.get('/frutas/importe/:precio', async (req, res) => {
    const { precio } = req.params;
    const client = await connect();
    try {
        const db = client.db('FrutasDb');
        const frutas = await db.collection('frutas').find({}).toArray();
        if (!frutas) {
            res.status(400).json({ error: 'No hay frutas' });
        }
        const resultado = frutas.filter((fruta) => fruta.precio >= precio);
        if (resultado.length === 0) {
            res.status(400).json({ error: 'No hay frutas con ese precio' });
        } else {
            res.json(resultado);
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
    } finally {
        disconnect();
    }
});
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto http://localhost:${port}`);
});
