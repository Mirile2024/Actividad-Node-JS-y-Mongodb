const { z } = require('zod')

const frutaSchema = z.object({
    id: z.number().int().min(1).max(10000),
    nombre: z.string().min(1).max(1000),
    precio: z.number().int().min(1).max(10000),
    imagen: z.string().min(1).max(100),
})

const validarfrutas = (data) => {
return frutaSchema.safeParse(data);
}

const validarfrutasParcialmente = (data) => {
return frutaSchema.partial().safeParse(data);
}

module.exports = { validarfrutas, validarfrutasParcialmente }