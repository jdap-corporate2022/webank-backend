const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Payment } = require('mercadopago');

// Inicialize com seu Access Token de Produção ou Teste do Mercado Pago
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN 
});

const payment = new Payment(client);

// Rota para realizar o Envio Pix
router.post('/api/pix/transferir', async (req, res) => {
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

        // Retorna o status e os dados do pagamento para o aplicativo Android
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

module.exports = router;
