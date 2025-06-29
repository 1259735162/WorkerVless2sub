let 快速订阅访问入口 = ['auto'];
let addresses = [];
let addressesapi = [];
let subConverter = 'SUBAPI.example.net';
let subConfig = '';
let FileName = '优选订阅生成器';
let SUBUpdateTime = 6;
let EndPS = '';
let 协议类型 = 'VLESS';
let 网络备案 = '';

async function 整理(内容) {
  var 替换后的内容 = 内容.replace(/[	|"'\r\n]+/g, ',').replace(/,+/g, ',');
  if (替换后的内容.charAt(0) == ',') 替换后的内容 = 替换后的内容.slice(1);
  if (替换后的内容.charAt(替换后的内容.length - 1) == ',') 替换后的内容 = 替换后的内容.slice(0, 替换后的内容.length - 1);
  const 地址数组 = 替换后的内容.split(',');
  return 地址数组;
}

function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

export default {
  async fetch(request, env) {
    if (env.TOKEN) 快速订阅访问入口 = await 整理(env.TOKEN);
    subConverter = env.SUBAPI || subConverter;
    subConfig = env.SUBCONFIG || subConfig;
    FileName = env.SUBNAME || FileName;
    网络备案 = env.BEIAN || env.BY || 网络备案;
    
    const url = new URL(request.url);
    let host = "";
    let uuid = "";
    let path = "";
    let sni = "";
    let type = "ws";
    let alpn = 'h3';
    
    if (快速订阅访问入口.length > 0 && 快速订阅访问入口.some(token => url.pathname.includes(token))) {
      host = "null";
      if (env.HOST) {
        const hosts = await 整理(env.HOST);
        host = hosts[Math.floor(Math.random() * hosts.length)];
      }
      
      if (env.PASSWORD) {
        协议类型 = 'Trojan';
        uuid = env.PASSWORD;
      } else {
        协议类型 = 'VLESS';
        uuid = env.UUID || "null";
      }
      
      path = env.PATH || "/?ed=2560";
      sni = env.SNI || host;
      type = env.TYPE || type;
    } else {
      host = url.searchParams.get('host');
      uuid = url.searchParams.get('uuid') || url.searchParams.get('password') || url.searchParams.get('pw');
      path = url.searchParams.get('path');
      sni = url.searchParams.get('sni') || host;
      type = url.searchParams.get('type') || type;
      alpn = url.searchParams.get('alpn') || alpn;
      
      if (url.searchParams.has('alterid')) {
        协议类型 = 'VMess';
      } else if (url.searchParams.has('uuid')) {
        协议类型 = 'VLESS';
      } else if (url.searchParams.has('password') || url.searchParams.has('pw')) {
        协议类型 = 'Trojan';
      }
      
      if (!url.pathname.includes("/sub")) {
        return await subHtml(request);
      }
      
      if (!host || !uuid) {
        const responseText = `
        缺少必填参数：host 和 uuid
        Missing required parameters: host and uuid
        
        ${url.origin}/sub?host=[your host]&uuid=[your uuid]&path=[your path]
        `;
        
        return new Response(responseText, {
          status: 202,
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        });
      }
      
      if (!path || path.trim() === '') {
        path = '/?ed=2560';
      } else {
        path = (path[0] === '/') ? path : '/' + path;
      }
    }
    
    if (env.ADD) addresses = await 整理(env.ADD);
    
    const responseBody = addresses.map(address => {
      let port = "443";
      let addressid = address;
      
      if (address.includes(':') && address.includes('#')) {
        const parts = address.split(':');
        address = parts[0];
        const subParts = parts[1].split('#');
        port = subParts[0];
        addressid = subParts[1];
      } else if (address.includes(':')) {
        const parts = address.split(':');
        address = parts[0];
        port = parts[1];
      } else if (address.includes('#')) {
        const parts = address.split('#');
        address = parts[0];
        addressid = parts[1];
      }
      
      if (协议类型 === 'VMess') {
        const vmessLink = `vmess://${utf8ToBase64(`{"v":"2","ps":"${addressid + EndPS}","add":"${address}","port":"${port}","id":"${uuid}","aid":"0","scy":"auto","net":"ws","type":"${type}","host":"${host}","path":"${path}","tls":"tls","sni":"${sni}","alpn":"${alpn}","fp":"randomized"}`)}`;
        return vmessLink;
      } else if (协议类型 === 'Trojan') {
        const trojanLink = `trojan://${uuid}@${address}:${port}?security=tls&sni=${sni}&alpn=${encodeURIComponent(alpn)}&type=${type}&host=${host}&path=${encodeURIComponent(path)}#${encodeURIComponent(addressid + EndPS)}`;
        return trojanLink;
      } else {
        const vlessLink = `vless://${uuid}@${address}:${port}?encryption=none&security=tls&sni=${sni}&alpn=${encodeURIComponent(alpn)}&type=${type}&host=${host}&path=${encodeURIComponent(path)}#${encodeURIComponent(addressid + EndPS)}`;
        return vlessLink;
      }
    }).join('\n');
    
    let base64Response;
    try {
      base64Response = btoa(responseBody);
    } catch (e) {
      const encoder = new TextEncoder();
      const data = encoder.encode(responseBody);
      base64Response = btoa(String.fromCharCode(...new Uint8Array(data)));
    }
    
    return new Response(base64Response, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "Profile-Update-Interval": `${SUBUpdateTime}`,
        "Profile-web-page-url": url.origin,
      },
    });
  }
};

async function subHtml(request) {
  const HTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${FileName}</title>
    <style>
      :root {
        --primary-color: #4361ee;
        --hover-color: #3b4fd3;
        --bg-color: #f5f6fa;
        --card-bg: #ffffff;
      }
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        background-color: var(--bg-color);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .container {
        position: relative;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        max-width: 600px;
        width: 90%;
        padding: 2rem;
        border-radius: 20px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        transition: transform 0.3s ease;
      }

      .container:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(0,0,0,0.1);
      }
      
      h1 {
        text-align: center;
        color: var(--primary-color);
        margin-bottom: 2rem;
        font-size: 1.8rem;
      }
      
      .input-group {
        margin-bottom: 1.5rem;
      }
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #555;
        font-weight: 500;
      }
      
      input {
        width: 100%;
        padding: 12px;
        border: 2px solid rgba(0, 0, 0, 0.15);
        border-radius: 10px;
        font-size: 1rem;
        transition: all 0.3s ease;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
      }

      input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
      }
      
      button {
        width: 100%;
        padding: 12px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 1.5rem;
      }
      
      button:hover {
        background-color: var(--hover-color);
        transform: translateY(-2px);
      }
      
      button:active {
        transform: translateY(0);
      }
      
      #result {
        background-color: #f8f9fa;
        font-family: monospace;
        word-break: break-all;
      }

      .beian-info {
        text-align: center;
        font-size: 13px;
      }

      .beian-info a {
        color: var(--primary-color);
        text-decoration: none;
        border-bottom: 1px dashed var(--primary-color);
        padding-bottom: 2px;
      }

      .beian-info a:hover {
        border-bottom-style: solid;
      }

      #qrcode {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
      }

      @media (max-width: 480px) {
        .container {
          padding: 1.5rem;
        }
        
        h1 {
          font-size: 1.5rem;
        }
      }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
  </head>
  <body>
    <div class="container">
      <h1>${FileName}</h1>
      <div class="input-group">
        <label for="link">节点链接</label>
        <input type="text" id="link" placeholder="请输入 VMess / VLESS / Trojan 节点链接">
      </div>
      
      <button onclick="generateLink()">生成优选订阅</button>
      
      <div class="input-group">
        <label for="result">优选订阅</label>
        <input type="text" id="result" readonly onclick="copyToClipboard()">
        <label id="qrcode" style="margin: 15px 10px -15px 10px;"></label>
      </div>
      <div class="beian-info">${网络备案}</div>
    </div>

    <script>
      function copyToClipboard() {
        const resultInput = document.getElementById('result');
        if (!resultInput.value) {
          return;
        }
        
        resultInput.select();
        navigator.clipboard.writeText(resultInput.value).then(() => {
          const tooltip = document.createElement('div');
          tooltip.style.position = 'fixed';
          tooltip.style.left = '50%';
          tooltip.style.top = '20px';
          tooltip.style.transform = 'translateX(-50%)';
          tooltip.style.padding = '8px 16px';
          tooltip.style.background = '#4361ee';
          tooltip.style.color = 'white';
          tooltip.style.borderRadius = '4px';
          tooltip.style.zIndex = '1000';
          tooltip.textContent = '已复制到剪贴板';
          
          document.body.appendChild(tooltip);
          
          setTimeout(() => {
            document.body.removeChild(tooltip);
          }, 2000);
        }).catch(err => {
          alert('复制失败，请手动复制');
        });
      }

      function generateLink() {
        const link = document.getElementById('link').value;
        if (!link) {
          alert('请输入节点链接');
          return;
        }
        
        let uuidType = 'uuid';
        const isTrojan = link.startsWith('trojan://');
        if (isTrojan) uuidType = 'password';
        let subLink = '';
        try {
          const isVMess = link.startsWith('vmess://');
          if (isVMess){
            const vmessLink = link.split('vmess://')[1];
            const vmessJson = JSON.parse(atob(vmessLink));
            
            const host = vmessJson.host;
            const uuid = vmessJson.id;
            const path = vmessJson.path || '/';
            const sni = vmessJson.sni || host;
            const type = vmessJson.type || 'none';
            const alpn = vmessJson.alpn || '';
            const alterId = vmessJson.aid || 0;
            const security = vmessJson.scy || 'auto';
            const domain = window.location.hostname;
            
            subLink = \`https://\${domain}/sub?host=\${host}&uuid=\${uuid}&path=\${encodeURIComponent(path)}&sni=\${sni}&type=\${type}&alpn=\${encodeURIComponent(alpn)}&alterid=\${alterId}&security=\${security}\`;
          } else {
            const uuid = link.split("//")[1].split("@")[0];
            const search = link.split("?")[1].split("#")[0];
            const domain = window.location.hostname;
            
            subLink = \`https://\${domain}/sub?\${uuidType}=\${uuid}&\${search}\`;
          }
          document.getElementById('result').value = subLink;

          // 更新二维码
          const qrcodeDiv = document.getElementById('qrcode');
          qrcodeDiv.innerHTML = '';
          new QRCode(qrcodeDiv, {
            text: subLink,
            width: 220,
            height: 220,
            colorDark: "#4a60ea",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.L,
            scale: 1
          });
        } catch (error) {
          alert('链接格式错误，请检查输入');
        }
      }
    </script>
  </body>
  </html>
  `;

  return new Response(HTML, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });
}
