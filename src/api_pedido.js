const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

app.use(express.json());

app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'views', 'doc_pedidos.html'));
});

app.use('/1.0', require('./routes/pedidoRoute.js'));

const PORT_PEDIDOS = process.env.PORT_PEDIDOS || 3002;

app.listen(PORT_PEDIDOS, () => {
    console.log(`Api pedido rest Running in port ${PORT_PEDIDOS}`);
});
