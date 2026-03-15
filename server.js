// Importar a framework Express
const express = require('express');
const app = express();

// Definir a porta onde o servidor vai correr localmente
const PORT = 3001;

// Configurar o servidor para conseguir ler dados em formato JSON
app.use(express.json());

// Rota de teste (O nosso frontend provisório)
app.get('/', (req, res) => {
    res.send('<h1>Plataforma de Interações Compensatórias a funcionar! 🧬</h1><p>O servidor backend está ativo.</p>');
});

// Ligar o servidor
app.listen(PORT, () => {
    console.log(`[Servidor] A correr perfeitamente! Abre no teu browser: http://localhost:${PORT}`);
});