document.getElementById('loadBtn').addEventListener('click', async () => {
  const url = document.getElementById('urlInput').value;
  if(!url) return alert('URLを入力してください');

  try {
    // Pixiv画像URLなら /pixiv-img を通す
    let displayURL = url.includes('pixiv.net') && url.match(/\.(jpg|png|gif|webp)$/i)
      ? `/pixiv-img?url=${encodeURIComponent(url)}`
      : `/proxy?url=${encodeURIComponent(url)}`;

    const res = await fetch(displayURL);
    
    // 画像なら <img> で表示
    if(displayURL.startsWith('/pixiv-img')){
      const blob = await res.blob();
      const imgURL = URL.createObjectURL(blob);
      document.getElementById('result').innerHTML = `<img src="${imgURL}" style="max-width:100%;">`;
    } else {
      document.getElementById('result').innerHTML = await res.text();
    }
  } catch(e){
    alert('読み込みに失敗しました');
  }
});
