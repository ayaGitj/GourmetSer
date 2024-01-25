document.querySelector("button").addEventListener("click", getPosition);

// 位置情報を取得する関数
function getPosition(event) {
  const status = document.querySelector(".status");
  const mapLink = document.querySelector(".map-link");
  const p = document.querySelector(".page");
  const range = ranges.value;
  const start = event.target.value;
  const page = event.target.dataset.page;
  mapLink.href = "";
  mapLink.textContent = "";

  // ブラウザがGeolocation APIに対応しているかをチェック
  if (!navigator.geolocation) {
    status.textContent = "ブラウザがGeolocationに対応していません";
    // 対応している → 位置情報取得開始
  } else {
    status.textContent = "情報取得中…";
    navigator.geolocation.getCurrentPosition(success, error);
  }
  // 位置情報取得成功時の処理
  async function success(position) {
    status.textContent = "";
    const latitude = position.coords.latitude; // 緯度取得
    const longitude = position.coords.longitude; // 経度取得
    // 緯度・経度を地図上で確認するためにGoogleMapへのリンクを作成
    mapLink.href = `https://maps.google.co.jp/maps?q= ${latitude} , ${longitude}`;
    mapLink.textContent = `緯度:${latitude}  経度:${longitude}  googlemapで現在地を確認する`;
    p.textContent = `${page}ページ目を表示中`;

    // クエリをFormDataに格納する
    const postData = new FormData(); // フォーム方式で送る場合
    postData.set("latitude", latitude); // それぞれ送られてきた値を格納する
    postData.set("longitude", longitude);
    postData.set("range", range);
    postData.set("start", start);

    const data = {
      method: "POST",
      body: postData,
    };
    //グルメサーチAPIからjsonを取得するリクエストをする
    const res = await fetch("main.php", data);
    const d = await res.json();
    const json = await JSON.parse(d);

    renderJson(json);
  }

  // 位置情報取得処理が失敗した場合
  function error(positionError) {
    switch (positionError.code) {
      case 0: // 原因不明エラー
        status.textContent = "原因不明のエラーが発生しました。";
        break;

      case 1: // タイムアウト
        status.textContent =
          "位置情報の取得時タイムアウトしました。";
        break;
    }
  }
}
// グルメサーチAPIから取得したjsonの内容をjavascriptでhtmlに反映させる関数
function renderJson(json) {
  document.querySelector(".main").innerHTML = "";
  document.querySelector("span").innerHTML = "";
  document.querySelector(
    "h2"
  ).textContent = `${json.results.results_available}件見つかりました。距離の近い順に表示しています。`;
  const fragment = document.createDocumentFragment();
  const template = document.getElementById("template");
  for (let i = 0; i < json.results.shop.length; i++) {
    const clone = template.content.cloneNode(true);

    //var img = document.createElement("img");
    //img.setAttribute('src', json['shop'][i]['photo']['pc']['l']);
    //child_div.appendChild(img);

    //var imgElement = clone.querySelector(".img src");
    //imgElement.setAttribute('src', json.results.shop[i].photo.pc.m);

    //var imgElement = clone.querySelector(
      //".img src"
    //).imgElement.setAttribute('src', json.results.shop[i].photo.pc.m);
    
    clone.querySelector(".img img")
    .setAttribute('src', json.results.shop[i].photo.pc.m);

    clone.querySelector(
      ".name a"
    ).textContent = `店名：${json.results.shop[i].name}`;
    clone.querySelector(".name a").href = json.results.shop[i].urls.pc;
    clone.querySelector(
      ".access a"
    ).textContent = `住所：${json.results.shop[i].address}`;
    clone.querySelector(".access a").href = json.results.shop[i].coupon_urls.pc;

    clone.querySelector(
      ".average"
    ).textContent = `予算：${json.results.shop[i].budget.average}`;
    clone.querySelector(
      ".open"
    ).textContent = `営業時間：${json.results.shop[i].open}`;

    fragment.appendChild(clone);
  }
  document.querySelector(".main").appendChild(fragment);

  // お店が10件以上見つかったらページネーションをする
  if (json.results.results_available > 10) {
    const i = Math.floor(json.results.results_available / 10) + 1;
    for (let j = 0; j < i; j++) {
      const span = document.createElement("a");
      span.textContent = j + 1;
      span.dataset.page = j + 1;
      span.value = 10 * j + 1;
      span.addEventListener("click", getPosition);
      fragment.appendChild(span);
    }
    document.querySelector("span").appendChild(fragment);
  }
  $('.news-container').paginathing({
    perPage: 10,
    insertAfter: '.news-container',
  });
}
