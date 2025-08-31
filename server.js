require('dotenv').config();
const express = require('express');
const axios = require('axios');
const compression = require('compression');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // 5分キャッシュ
const PORT = process.env.PORT || 3000;

app.use(compression()); // 転送圧縮
app.use(express.static('public'));

// トップページ
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

// プロキシAPI
app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('URLを入力してください');

  const cached = cache.get(url);
  if (cached) return res.send(cached);

  try {
    const response = await axios.get(url, { responseType: 'text' });
    cache.set(url, response.data);
    res.send(response.data);
  } catch (err) {
    res.status(500).send('読み込みエラー');
  }
});

app.listen(PORT, () => console.log(`犬好きProxyがポート${PORT}で起動中`));
