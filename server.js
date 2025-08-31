require('dotenv').config();
const express = require('express');
const axios = require('axios');
const compression = require('compression');
const NodeCache = require('node-cache');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const cache = new NodeCache({ stdTTL: 60 * 5 }); // 5分キャッシュ

const PORT = process.env.PORT || 3000;

// セキュリティヘッダー
app.use(helmet());
app.use(cors());
app.use(compression()); // 圧縮
app.use(express.static('public')); // 静的ファイル

// トップページ
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// プロキシAPI
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URLを入力してください');

  // キャッシュ確認
  const cached = cache.get(targetUrl);
  if (cached) {
    console.log('Cache hit:', targetUrl);
    return res.send(cached);
  }

  try {
    // 非同期リクエスト
    const response = await axios.get(targetUrl, {
      responseType: 'text'
    });
    const data = response.data;

    // キャッシュ保存
    cache.set(targetUrl, data);

    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('読み込みエラー');
  }
});

app.listen(PORT, () => {
  console.log(`犬好きProxyがポート${PORT}で起動しました`);
});
