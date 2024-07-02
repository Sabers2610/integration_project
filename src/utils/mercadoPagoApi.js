const { MercadoPagoConfig, Preference } = require("mercadopago")
require("dotenv").config()

async function createOrder(id_pedido, total) {
    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO })

    const preference = new Preference(client)
    const response = await preference.create({
        body: {
            items: [
                {
                    title: `PEDIDO N° ${id_pedido}`,
                    quantity: 1,
                    unit_price: total
                }
            ],
        }
    })
        .then(console.log("Orden generada"))
        .catch(console.log);
    return response.sandbox_init_point

}

module.exports = createOrder