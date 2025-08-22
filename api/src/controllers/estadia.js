const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const read = async (req, res) => {
    try {
        if (req.params.placa) {
            const estadias = await prisma.estadia.findMany({
                where: { placa: req.params.placa }
            });
            res.json(estadias).end();
        }
        else {
            const estadias = await prisma.estadia.findMany();
            res.json(estadias).end();
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar estadias' });
    }
}

const create = async (req, res) => {
    try {
        const estadia = await prisma.estadia.create({
            data: req.body
        });
        res.status(201).json(estadia).end();
    } catch (error) {
        res.status(400).json({ erro: 'Erro ao criar estadia, verifique se a placa não está duplicada', error: error.message }).end();
    }
}

const update = async (req, res) => {
    const { id } = req.params;
    try {
        const estadia = await prisma.estadia.update({
            where: { id: Number(id) },
            data: req.body
        });
        res.status(202).json(estadia);
    } catch (error) {
        res.status(400).json({ erro: 'Erro ao atualizar estadia', error: error.message });
    }
}

const del = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.estadia.delete({
            where: { id: Number(id) }
        });
        res.status(204).send();
    } catch (error) {
        //Se o estadia não for encontrado retornar erro 404
        if (error.code === 'P2025') {
            return res.status(404).json({ erro: 'estadia não encontrado', error: error.message });
        } else {
            //Para outros erros, retornar erro 400
            res.status(400).json({ erro: 'Erro ao deletar estadia', error: error.message });
        }
    }
}

module.exports = {
    read,
    create,
    update,
    del
};