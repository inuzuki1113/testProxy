document.getElementById('loadBtn').addEventListener('click', async () => {
  const url = document.getElementById('urlInput').value;
  if(!url) return alert('URLを入力してください');
  try{
    const res = await fetch(`/proxy?url=${encodeURIComponent(url)}`);
    document.getElementById('result').innerHTML = await res.text();
  }catch(e){
    alert('読み込みに失敗しました');
  }
});
