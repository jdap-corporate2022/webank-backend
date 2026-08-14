const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || ''
});

const payment = new Payment(client);

// Rota inicial de teste
app.get('/', (req, res) => {
    res.send('API WeBank + Mercado Pago conectada e ativa!');
});

// Rota para realizar o Envio Pix
app.post('/api/pix/transferir', async (req, res) => {
    const { chavePix, tipoChave, valor, nomeDestinatario, emailPayer } = req.body;

    try {
        const body = {
            transaction_amount: Number(valor),
            description: `Transferência Pix WeBank para ${nomeDestinatario || chavePix}`,
            payment_method_id: 'pix',
            payer: {
                email: emailPayer || 'usuario@webank.com.br'
            }
        };

        const response = await payment.create({ body });

        return res.status(200).json({
            sucesso: true,
            idPagamento: response.id,
            status: response.status,
            statusDetail: response.status_detail,
            qrCode: response.point_of_interaction?.transaction_data?.qr_code,
            qrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64
        });

    } catch (error) {
        console.error('Erro na transferência Pix:', error);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Falha ao processar pagamento Pix via Mercado Pago',
            erro: error.message
        });
    }
});

// Inicia o servidor na porta configurada pelo Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor WeBank rodando na porta ${PORT}`);
});
