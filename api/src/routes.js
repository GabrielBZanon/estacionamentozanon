const express = require('express');
const routes = express.Router();

const Veiculo = require('./controllers/veiculo');
const Estadia = require('./controllers/estadia');

routes.get('/', (req, res) => {
    const api = {
        titulo: 'API Estacionamento',
        versao: '1.0.0',
        rotas: [
            { metodo: 'GET', caminho: '/veiculos' },
            { metodo: 'GET', caminho: '/veiculos/:placa' },
            { metodo: 'POST', caminho: '/veiculos' },
            { metodo: 'PATCH', caminho: '/veiculos/:placa' },
            { metodo: 'DELETE', caminho: '/veiculos/:placa' },
            { metodo: 'GET', caminho: '/estadias' },
            { metodo: 'GET', caminho: '/estadias/:placa' },
            { metodo: 'POST', caminho: '/estadias' },
            { metodo: 'PATCH', caminho: '/estadias/:id' },
            { metodo: 'DELETE', caminho: '/estadias/:id' }
        ]
    }
    res.json(api);
});

routes.get('/veiculos', Veiculo.read);
routes.get('/veiculos/:placa', Veiculo.read);
routes.post('/veiculos', Veiculo.create);
routes.patch('/veiculos/:placa', Veiculo.update);
routes.delete('/veiculos/:placa', Veiculo.del);

routes.get('/estadias', Estadia.read);
routes.get('/estadias/:placa', Estadia.read);
routes.post('/estadias', Estadia.create);
routes.patch('/estadias/:id', Estadia.update);
routes.delete('/estadias/:id', Estadia.del);

module.exports = routes;