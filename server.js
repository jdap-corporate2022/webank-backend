const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(cors());

// Token de Acesso do Mercado Pago (Carregado das variáveis de ambiente do Render)
const MERCADO_PAGO_TOKEN = process.env.MERCADO_PAGO_TOKEN;

// Rota de Teste
app.get('/', (req, res) => {
    res.send('API WeBank + Mercado Pago conectada e ativa!');
});

// Rota de Consulta Pix Real no DICT via Mercado Pago
app.get('/api/pix/consultar/:chave', async (req, res) => {
    const chave = req.params.chave;

    try {
        // Chamada à API de consulta de chaves/cobranças do Mercado Pago
        const response = await axios.get(`https://api.mercadopago.com/v1/pix/keys/${encodeURIComponent(chave)}`, {
            headers: {
                'Authorization': `Bearer ${MERCADO_PAGO_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const dados = response.data;

        // Retorna as informações do titular para o aplicativo WeBank
        res.json({
            sucesso: true,
            chave: chave,
            recebedor: {
                nome: dados.owner?.name || "Nome não informado",
                cpfMascarado: dados.owner?.identification?.number || "***.***.***-**",
                instituicao: dados.bank?.name || "Mercado Pago IP"
            }
        });

    } catch (error) {
        console.error("Erro no Mercado Pago:", error.response ? error.response.data : error.message);
        
        res.status(404).json({
            sucesso: false,
            mensagem: "Chave Pix não encontrada ou inválida."
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
