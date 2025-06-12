const { connect, disconnect } = require('./db/connection');
const express = require('express');
const app = express();
const port = process.env.port || 3000;

app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hola mundo');
});
app.get('/frutas', async (req, res) => {
    const client = await connect();
    try {
        const db = client.db('FrutasDb');
        const frutas = await db.collection('frutas').find({}).toArray();
        if (!frutas) {
            res.status(400).json({ error: 'No hay frutas' });
        }
        res.json(frutas);
    } catch (error) {
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
    } finally {
        disconnect();
    }
});
app.get('/frutas/:id', async (req, res) => {
    const client = await connect();
    const id = parseInt(req.params.id);
    //    if(isNaN(id)){
    //        res.status(400).json({ error: 'El id debe ser un numero' });
    //    }
    try {
        const db = client.db('FrutasDb');
        const fruta = await db.collection('frutas').findOne({ id });
        if (!fruta) {
            res.status(400).json({ error: 'No hay frutas con ese ID' });
        }
        res.json(fruta);
    } catch (error) {
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
    } finally {
        disconnect();
    }
});

app.get('/frutas/nombre/:nombre', async (req, res) => {
    const { nombre } = req.params;
    const regExp = new RegExp(/^[a-z]+$/);
    if (!regExp.test(nombre)) {
        res.status(400).json({ error: 'Nombre no valido' });
    } else {
        const client = await connect();
        try {
            const db = client.db('FrutasDb');
            const frutas = await db.collection('frutas').find({}).toArray();
            if (!frutas) {
                res.status(400).json({ error: 'No hay frutas' });
            }
            const resultado = frutas.filter((fruta) => fruta.nombre.toLowerCase().includes(nombre.toLowerCase()));
            res.json(resultado);
        } catch (error) {
            res.status(500).json({ error: 'Error al conectar a la base de datos' });
        } finally {
            disconnect();
        }
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
        if ( resultado.length === 0) {
            res.status(400).json({ error: 'No hay frutas con ese precio'});
        }else{
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
