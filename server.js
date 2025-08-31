require('dotenv').config();
const express = require('express');
const axios = require('axios');
const compression = require('compression');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // 5分キャッシュ
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(express.static('public'));

// トップページ
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

// プロキシAPI（HTMLや一般サイト用）
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

// Pixiv画像専用プロキシ
app.get('/pixiv-img', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('画像URLを入力してください');

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer', // 画像バイナリ
      headers: {
        'Referer': 'https://www.pixiv.net/', // Pixivブロック回避
        'User-Agent': 'Mozilla/5.0'
      }
    });
    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (err) {
    res.status(500).send('画像取得エラー');
  }
});

app.listen(PORT, () => console.log(`犬好きProxy Pixiv対応版がポート${PORT}で起動中`));
