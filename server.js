const { connect, disconnect } = require('./db/connection');
const { ObjectId } = require('mongodb');
const express = require('express');
const { validarfrutas, validarfrutasParcialmente } = require("./schemas/fruta.js");
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
    } catch (error) {
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }
});
app.get('/frutas/:id', async (req, res) => {//consulta por _id generado por mongodb
    const { id } = req.params;
    try {
        const fruta = await req.db.findOne({ _id: new ObjectId(id) });
        if (!fruta) {
            res.status(400).json({ error: 'No hay frutas con ese ID' });
        } else {
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
        const frutas = await req.db.find({ nombre: { $regex: nombre } }).toArray();
        if (!frutas) {
            res.status(400).json({ error: 'No hay frutas' });
        }
        res.json(frutas);
    } catch (error) {
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }
});

app.get('/frutas/importe/:precio', async (req, res) => {
    const precio = parseInt(req.params.precio);
    try {
        const frutas = await req.db.find({ precio: { $gte: precio } }).toArray();
        if (!frutas || frutas.length === 0) {
            res.status(400).json({ error: 'No hay frutas' });
        } else {
            res.json(frutas);
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }
});
//agregar frutas
app.post('/frutas', async (req, res) => {
    const resultado = validarfrutas(req.body);
    if (!resultado.success) {
        res.status(400).json({ error: resultado.error.message });
    }
    try {
        await req.db.insertOne(resultado.data);
        res.status(201).json(resultado.data);
    }
    catch (error) {
        res.status(500).json({ error: "Error al crear la fruta" });
    }
});
//borrar frutas
app.delete('/frutas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { deletedCount } = await req.db.deleteOne({ _id: new ObjectId(id) });
        res
            .status(deletedCount === 0 ? 404 : 204)
            .json(
                deletedCount === 0
                    ? { error: "No hay frutas con ese ID" }
                    : { message: "Fruta borrada" }
            );
    } catch (error) {
        res.status(500).json({ error: "Error al borrar la fruta" });
    }
});
//Modificar frutas

// app.patch('/frutas/:id', async (req, res) => {
//     const { id } = req.params;
//     const resultado = validarfrutasParcialmente(req.body);
//     const nuevaFruta = resultado.data;
//     if (!resultado.success) {
//         res.status(400).json({ error: resultado.error.message });
//     }
//     try {
//         const { updateResult } = await req.db.findOneAndUpdate({ _id: new ObjectId(id) },{$set: nuevaFruta}, { returnDocument: "after" });
//         if (!{updateResult}) {
//             res.status(404).json({ error: "No hay frutas con ese ID" });
//         } else {   
//             const frutaModificada = await req.db.findOne({ _id: new ObjectId(id) });
//             res.status(200).json({frutaModificada});
//         }

//     } catch (error) {
//         res.status(500).json({ error: "Error al modificar la fruta" });
//     }
// });
app.put('/frutas/:id', async (req, res) => {
    const { id } = req.params;
    const resultado = validarfrutasParcialmente(req.body);
    const nuevaFruta = resultado.data;
    if (!resultado.success) {
        res.status(400).json({ error: resultado.error.message });
    }
    try {
        const { updateResult } = await req.db.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: nuevaFruta }, { returnDocument: "after" });
        if (!{updateResult}) {
            res.status(404).json({ error: "No hay frutas con ese ID" });
        } else {
            const frutaModificada = await req.db.findOne({ _id: new ObjectId(id) });
            res.status(200).json({ frutaModificada });
        }

    } catch (error) {
        res.status(500).json({ error: "Error al modificar la fruta" });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto http://localhost:${port}`);
});
