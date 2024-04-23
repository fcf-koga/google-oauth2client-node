const querystring = require('querystring')
const url = require('url')
const { Buffer } = require('node:buffer');

const DISCOVERY_URL = "https://accounts.google.com/"
const DISCOVERY_ENDPOINT = DISCOVERY_URL + ".well-known/openid-configuration"
const TOKENINFO_ENDPOINT = "https://oauth2.googleapis.com/tokeninfo"

const REDIRECT_URI = "http://localhost:8080/callback"
const CLIENT_ID = "クライアントID"
const CLIENT_SECRET = "シークレットID"

function start (request,response, postData) {
  console.log("Request handler 'start' was called.")
  const contents = '<html>' +
    '<head>' +
    '<meta http-equiv="Content-Type" content="text/html; ' +
    'charset=UTF-8" />' +
    '</head>' +
    '<body>' +
    '<p>' +
    '<button onclick="location.href=\'/oauth2\'">アクセストークン取得</button>' +
    '</p>' +
    '</body>' +
    '</html>'

  response.writeHead(200, { 'Content-Type': 'text/html' })
  response.write(contents)
  response.end()
}

async function oauth2 (request,response, postData) {
  console.log("Request handler 'oauth2' was called.")

  // ディスカバリドキュメントから認証エンドポイントを取得する。
  const resp = await fetch(DISCOVERY_ENDPOINT);
  const provider_cfg = await resp.json();
  const authorization_endpoint = provider_cfg['authorization_endpoint']

  // 認証リクエスト用のパラメータの設定
  const params = {
    client_id: CLIENT_ID,
    response_type: "code",
    scope: ["openid email profile"],
    redirect_uri: REDIRECT_URI,
    prompt: "select_account",
  };

  const query = new URLSearchParams(params);
  const request_url = authorization_endpoint + `?${query}`

  // ブラウザにリダイレクトを返す
  response.writeHead(302, { 'Location': request_url })
  response.end()

}
async function callback (request,response, postData) {

  //リクエストパラメータから認可コードを取得する
  const query = url.parse(request.url).query;
  const code = querystring.parse(query).code;

  // ディスカバリドキュメントからトークンエンドポイントを取得する。
  const resp = await fetch(DISCOVERY_ENDPOINT);
  const provider_cfg = await resp.json();
  const authorization_endpoint = provider_cfg['token_endpoint']

  // リクエストボディの設定
  const body = new URLSearchParams({
    "code": code,
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "redirect_uri": REDIRECT_URI,
    "grant_type": "authorization_code",
  });

  const resp_token = await fetch(authorization_endpoint, {
    method: "POST",
    headers:{
      "Content-Type":"application/x-www-form-urlencoded",
    },
    body,
  })
  const token = await resp_token.json();

  process.env.ACCESS_TOKEN = token.access_token;
  process.env.EXPIRES_IN = token.expires_in;
  process.env.SCOPE = token.scope;
  process.env.TOKEN_TYPE = token.token_type;
  process.env.ID_TOKEN = token.id_token;

  const contents = '<html>' +
  '<head>' +
  '<meta http-equiv="Content-Type" content="text/html; ' +
  'charset=UTF-8" />' +
  '</head>' +
  '<body>' +
  '<p>' +
  '<table border="2" style="table-layout:fixed;width:100%;">' +
  '<thead>' +
  '<tr>' +
  '<th>Key</th>' +
  '<th>Value</th>' +
  '</tr>' +
  '</thead>' +
  '<colgroup>' +
  '<col style="width:10%;">' +
  '<col style="width:90%;">' +
  '</colgroup>' +
  '<tbody>' +
  '<tr>' +
  '<th>access_token</th>' +
  '<td style="word-wrap:break-word;">' + process.env.ACCESS_TOKEN + '</td>' +
  '</tr>' +
  '<tr>' +
  '<th>expires_in</th>' +
  '<td style="word-wrap:break-word;">' + process.env.EXPIRES_IN + '</td>' +
  '</tr>' +
  '<tr>' +
  '<th>scope</th>' +
  '<td style="word-wrap:break-word;">' + process.env.SCOPE + '</td>' +
  '</tr>' +
  '<tr>' +
  '<th>token_type</th>' +
  '<td style="word-wrap:break-word;">' + process.env.TOKEN_TYPE + '</td>' +
  '</tr>' +
  '<tr>' +
  '<th>id_token</th>' +
  '<td style="word-wrap:break-word;">' +  process.env.ID_TOKEN + '</td>' +
  '</tr>' +
  '</tbody>' +
  '</table>' +
  '</p>' +
  '<p>' +
  '<button onclick="location.href=\'/decode\'">検証</button>' +
  '<button onclick="location.href=\'/\'">戻る</button>' +
  '</p>' +
  '</body>' +
  '</html>'

  response.writeHead(200, { 'Content-Type': 'text/html' })
  response.write(contents)
  response.end()
}

async function decode (request,response, postData) {

  // アクセストークンの検証
  // リクエストパラメータの設定
  const params = {
    access_token: process.env.ACCESS_TOKEN,
  };

  const query = new URLSearchParams(params);
  const request_url = TOKENINFO_ENDPOINT + `?${query}`

  // tokeninfoエンドポイントへリクエスト
  const resp_token = await fetch(request_url);
  const token_info = await resp_token.text();
  
  // IDトークンのデコード
  // 「ヘッダー.ペイロード.署名」のJWS形式を分割
  const access_token = process.env.ID_TOKEN.split('.');
  let [header,payload,signature] = access_token;

  // IDトークン（ヘッダー、ペイロード）のデコード
  header = Buffer.from(header,'base64');
  payload = Buffer.from(payload,'base64');

  const contents = '<html>' +
  '<head>' +
  '<meta http-equiv="Content-Type" content="text/html; ' +
  'charset=UTF-8" />' +
  '</head>' +
  '<body>' +
  '<p>' +
  '<table border="2" style="table-layout:fixed;width:100%;">' +
  '<thead>' +
  '<tr>' +
  '<th colspan="2">Key</th>' +
  '<th>Value</th>' +
  '</tr>' +
  '</thead>' +
  '<colgroup>' +
  '<col style="width:10%;">' +
  '<col style="width:10%;">' +
  '<col style="width:80%;">' +
  '</colgroup>' +
  '<tbody>' +
  '<tr>' +
  '<th colspan="2">access_token</th>' +
  '<td style="word-wrap:break-word;">' + token_info + '</td>' +
  '</tr>' +
  '<tr>' +
  '<th colspan="2">expires_in</th>' +
  '<td style="word-wrap:break-word;">' + process.env.EXPIRES_IN + '</td>' +
  '</tr>' +
  '<tr>' +
  '<th colspan="2">scope</th>' +
  '<td style="word-wrap:break-word;">' + process.env.SCOPE + '</td>' +
  '</tr>' +
  '<tr>' +
  '<th colspan="2">token_type</th>' +
  '<td style="word-wrap:break-word;">' + process.env.TOKEN_TYPE + '</td>' +
  '</tr>' +
  '<tr>' +
  '<th rowspan="2">id_token</th>' +
  '<td style="word-wrap:break-word;">header</td>' +
  '<td style="word-wrap:break-word;">' +  header + '</td>' +
  '</tr>' +
  '<td style="word-wrap:break-word;">payload</td>' +
  '<td style="word-wrap:break-word;">' +  payload + '</td>' +
  '</tr>' +
  '</tbody>' +
  '</table>' +
  '</p>' +
  '<button onclick="location.href=\'/\'">戻る</button>' +
  '</body>' +
  '</html>'

  response.writeHead(200, { 'Content-Type': 'text/html' })
  response.write(contents)
  response.end()
}

exports.start = start
exports.oauth2 = oauth2
exports.callback = callback
exports.decode = decode


