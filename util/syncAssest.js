const axios = require("axios");
// const jsdom = require("jsdom");
const vm = require('vm');
/**
 * 同步最新的资源文件
 * @returns {Promise<{
 *  newKr: Record<string, string>,
 *  newZh: Record<string, string>
 * }>}
 */
exports.SyncAssest = async function SyncAssest() {
  const assest = await axios.default({
    method: 'post',
    url: 'https://www.notion.so/api/v3/getAssetsJsonV2',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      "hash": ""
    })
  }).catch(e => {
    console.log(e)
  });

  const assestLocaleSetupJs = assest.data.files.filter(item => {
    return item.path?.startsWith("/localeSetup")
  }).reduce((acc, item) => {
    /** @type {string} */
    const path = item.path;
    const res = path.match(/localeSetup\-([a-zA-Z]{2}\-[a-zA-Z]{2})/)
    if (res) {
      acc[res[1]] = path;
    }
    return acc;
    // localeSetup-zh-CN-17e5e843ce175ab41469722862bf44a1.js
  }, {})
  console.log(assestLocaleSetupJs)

  const fetchConfig = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "zh-CN,zh;q=0.9",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Microsoft Edge\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "cookie": "__cf_bm=X0TDlSAm_.NASJOw7sak30_BA8gsKcqZBJi5ow_GujI-1693678258-0-AfPn3ckoC9eCZMn/4G/g+AhKqya/aCJgV57fH61lgBies2WUt+w4d1T9WXqe6ybRTx4nOBMG56nA6Mu9VXY2aHQ=; _cfuvid=Qy7pSVz4nwpzDN_WuhP4mUvMFOBBPx50PyyqSvFNZwA-1693678258614-0-604800000"
  } ?? { 
    'authority': 'www.notion.so', 
    'if-modified-since': 'Tue, 06 Jun 2023 22:49:53 GMT', 
    'if-none-match': 'W/"4b79efc8d01ace001fb68165f049cf0d"', 
    'sec-fetch-user': '?1', 
    'upgrade-insecure-requests': '1', 
    'Cache-Control': 'no-cache'
  }
  return Promise.all([
    axios.default({
      method: 'get',
      url: "https://www.notion.so" + assestLocaleSetupJs["ko-KR"],
      headers: fetchConfig,
      responseType: 'document'
    }),
    axios.default({
      method: 'get',
      url: "https://www.notion.so" + assestLocaleSetupJs["zh-CN"],
      headers: fetchConfig,
      responseType: 'document'
    }),
  ]).then(([krHtml, zhHtml]) => {
    // const newKr = jsdom.JSDOM.fragment(krHtml.data);
    // const newZh = jsdom.JSDOM.fragment(zhHtml.data)

    // 这里是js文件的运行模板，
    // TODO: 之后补充自动解析AST以补充翻译条目的逻辑

    return {
      newKr: krHtml,
      newZh: zhHtml,
    };
  })
};
