import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeOCC } from './scrap/scrape.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para buscar
app.post('/search', async (req, res) => {
    try {
        const { searchTerm } = req.body;
        
        if (!searchTerm || !searchTerm.trim()) {
            return res.json({ success: false, error: 'Se requiere de un término para buscar' });
        }

        console.log(`Buscando: ${searchTerm}`);
        
        // Llamar a la función del scraper
        const results = await scrapeOCC(searchTerm.trim());
        
        if (results.length === 0) {
            return res.json({ success: false, error: '¡Ups! 😣 Parece que no hemos encontrado vacantes.' });
        }

        console.log(`Se encontraron ${results.length} vacantes`);
        
        res.json({ 
            success: true, 
            message: `¡Yuju! 🎉 Encontramos ${results.length} vacantes, échales un vistazo.`
        });

    } catch (error) {
        console.error('Se ha producido un error en la búsqueda:', error);
        res.json({ success: false, error: 'Se ha producido un error al procesar la búsqueda' });
    }
});

// Servir resultados.json desde la raíz del proyecto
app.get('/resultados.json', (req, res) => {
  const filePath = path.join(__dirname, '..', 'resultados.json');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send({ error: 'No hay resultados.json' });
  }
});

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
}); 