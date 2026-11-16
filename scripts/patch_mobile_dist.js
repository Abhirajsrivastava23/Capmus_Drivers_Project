const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../mobile/dist');
console.log('Processing distDir:', distDir);

// 1. Find AppEntry bundle
const jsDir = path.join(distDir, '_expo/static/js/web');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.startsWith('AppEntry-') && f.endsWith('.js'));
if (jsFiles.length === 0) {
  console.error('No AppEntry found!');
  process.exit(1);
}
const jsFile = path.join(jsDir, jsFiles[0]);
console.log('Patching bundle:', jsFile);
let code = fs.readFileSync(jsFile, 'utf8');

// Replace all "/assets/ with "./assets/
const assetMatches = (code.match(/"\/assets\//g) || []).length;
code = code.replace(/"\/assets\//g, '"./assets/');
console.log(`Replaced ${assetMatches} "/assets/" occurrences with "./assets/"`);

// Replace all "/_expo/ with "./_expo/
const expoMatches = (code.match(/"\/_expo\//g) || []).length;
code = code.replace(/"\/_expo\//g, '"./_expo/');
console.log(`Replaced ${expoMatches} "/_expo/" occurrences with "./_expo/"`);

fs.writeFileSync(jsFile, code);

// Patch API_BASE to prevent timeout against dead domains or private IPs
const deadDomainTarget = "const s=_e.CLOUD_API_BASE='https://capmusdriversproject.vercel.app/api',n=_e.LOCAL_WIFI_BASE='http://192.168.51.113:5001/api',c=_e.API_BASE='localhost'===window.location.hostname||'127.0.0.1'===window.location.hostname?'http://localhost:5001/api':s,l=t.default.create({baseURL:c,headers:{'Content-Type':'application/json'},timeout:1e4});_e.setAuthToken=e=>{e?l.defaults.headers.common.Authorization=`Bearer ${e}`:delete l.defaults.headers.common.Authorization},l.interceptors.request.use(async e=>{try{const t=await o.default.getItem('campus_drivers_token');t&&(e.headers.Authorization=`Bearer ${t}`)}catch(e){console.warn('Error reading token from AsyncStorage',e)}return e}),l.interceptors.response.use(e=>e,async e=>{const t=e.config;return!t||t._retry||500!==e.response?.status&&'ERR_NETWORK'!==e.code&&e.response||(t._retry=!0,t.baseURL!==s)?Promise.reject(e):(console.log('[API] Falling back to local WiFi backend:',n),t.baseURL=n,l.request(t))})";
const dynamicApiReplacement = "const s=_e.CLOUD_API_BASE=(typeof window!=='undefined'&&window.location&&window.location.origin)?window.location.origin+'/api':'/api',n=_e.LOCAL_WIFI_BASE=(typeof window!=='undefined'&&window.location&&window.location.hostname)?'http://'+window.location.hostname+':5001/api':'http://localhost:5001/api',c=_e.API_BASE=(typeof window!=='undefined'&&window.location)?(window.location.port==='8081'||window.location.port==='19006'?n:(window.location.origin?window.location.origin+'/api':'/api')):'http://localhost:5001/api',l=t.default.create({baseURL:c,headers:{'Content-Type':'application/json'},timeout:15e3});_e.setAuthToken=e=>{e?l.defaults.headers.common.Authorization=`Bearer ${e}`:delete l.defaults.headers.common.Authorization},l.interceptors.request.use(async e=>{try{const t=await o.default.getItem('campus_drivers_token');t&&(e.headers.Authorization=`Bearer ${t}`)}catch(e){console.warn('Error reading token from AsyncStorage',e)}return e}),l.interceptors.response.use(e=>e,async e=>{const t=e.config;if(t&&!t._retry&&(e.code==='ERR_NETWORK'||!e.response)){t._retry=!0;if(typeof window!=='undefined'&&t.baseURL!==n&&window.location.port!=='5001'){console.log('[API] Retrying on backend port 5001:',n);t.baseURL=n;return l.request(t);}}return Promise.reject(e);})";

if (code.includes(deadDomainTarget)) {
  code = code.replace(deadDomainTarget, dynamicApiReplacement);
  fs.writeFileSync(jsFile, code);
  console.log('Patched dynamic API_BASE in AppEntry bundle');
}

// 2. Build Base64 fonts.css
const fontsDir = path.join(distDir, 'assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts');
function getB64(file) {
  if (!file) return '';
  const full = path.join(fontsDir, file);
  if (!fs.existsSync(full)) {
    console.warn('Font file not found:', full);
    return '';
  }
  return fs.readFileSync(full).toString('base64');
}

const fontFiles = fs.readdirSync(fontsDir);
const ioniconsFile = fontFiles.find(f => f.startsWith('Ionicons.'));
const mciFile = fontFiles.find(f => f.startsWith('MaterialCommunityIcons.'));
const fa5SolidFile = fontFiles.find(f => f.startsWith('FontAwesome5_Solid.'));
const fa5RegFile = fontFiles.find(f => f.startsWith('FontAwesome5_Regular.'));
const fa5BrandFile = fontFiles.find(f => f.startsWith('FontAwesome5_Brands.'));
const miFile = fontFiles.find(f => f.startsWith('MaterialIcons.'));
const faFile = fontFiles.find(f => f.startsWith('FontAwesome.'));

const ioniconsB64 = getB64(ioniconsFile);
const mciB64 = getB64(mciFile);
const fa5SolidB64 = getB64(fa5SolidFile);
const fa5RegB64 = getB64(fa5RegFile);
const fa5BrandB64 = getB64(fa5BrandFile);
const miB64 = getB64(miFile);
const faB64 = getB64(faFile);

let fontsCss = `
/* Offline Inlined Vector Icons - Direct Base64 Data URIs (CORS & file:// safe) */
@font-face {
  font-family: 'ionicons';
  src: url('data:font/truetype;charset=utf-8;base64,${ioniconsB64}') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'Ionicons';
  src: url('data:font/truetype;charset=utf-8;base64,${ioniconsB64}') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'material-community';
  src: url('data:font/truetype;charset=utf-8;base64,${mciB64}') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'MaterialCommunityIcons';
  src: url('data:font/truetype;charset=utf-8;base64,${mciB64}') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'FontAwesome5Free-Solid';
  src: url('data:font/truetype;charset=utf-8;base64,${fa5SolidB64}') format('truetype');
  font-display: swap;
  font-weight: 900;
}
@font-face {
  font-family: 'FontAwesome5_Solid';
  src: url('data:font/truetype;charset=utf-8;base64,${fa5SolidB64}') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'FontAwesome5';
  src: url('data:font/truetype;charset=utf-8;base64,${fa5SolidB64}') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'FontAwesome5Free-Regular';
  src: url('data:font/truetype;charset=utf-8;base64,${fa5RegB64}') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'FontAwesome5_Regular';
  src: url('data:font/truetype;charset=utf-8;base64,${fa5RegB64}') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'FontAwesome5Free-Brand';
  src: url('data:font/truetype;charset=utf-8;base64,${fa5BrandB64}') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'FontAwesome5_Brands';
  src: url('data:font/truetype;charset=utf-8;base64,${fa5BrandB64}') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'Material Icons';
  src: url('data:font/truetype;charset=utf-8;base64,${miB64}') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'MaterialIcons';
  src: url('data:font/truetype;charset=utf-8;base64,${miB64}') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'FontAwesome';
  src: url('data:font/truetype;charset=utf-8;base64,${faB64}') format('truetype');
  font-display: swap;
}

/* Universal Focus Outline / Golden / Blue Ring Remover */
* {
  -webkit-tap-highlight-color: transparent !important;
}
input,
textarea,
select,
button,
[contenteditable],
[tabindex],
[data-focusable="true"],
[role="textbox"] {
  outline: none !important;
  outline-width: 0 !important;
  outline-style: none !important;
  outline-color: transparent !important;
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  -webkit-tap-highlight-color: transparent !important;
  -webkit-focus-ring-color: transparent !important;
}
input:focus,
input:focus-visible,
input:active,
textarea:focus,
textarea:focus-visible,
textarea:active,
[data-focusable="true"]:focus,
[data-focusable="true"]:focus-visible,
[role="textbox"]:focus,
[role="textbox"]:focus-visible,
*:focus,
*:focus-visible,
*:focus-within {
  outline: none !important;
  outline-width: 0 !important;
  outline-style: none !important;
  outline-color: transparent !important;
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  -webkit-focus-ring-color: transparent !important;
}
/* Prevent Chrome / WebView Autofill background color from turning yellow/white/blue */
input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus, 
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #14151D inset !important;
  -webkit-text-fill-color: #FFFFFF !important;
  caret-color: #FFFFFF !important;
  transition: background-color 5000s ease-in-out 0s;
}
`;

fs.writeFileSync(path.join(distDir, 'fonts.css'), fontsCss);
console.log('Generated fonts.css with size:', fontsCss.length);

// 3. Update index.html
const htmlPath = path.join(distDir, 'index.html');
let html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#090A0D" />
    <title>Campus Drivers</title>
    <script>
      (function() {
        if (window.location.protocol !== 'file:' && window.location.pathname === '/app') {
          window.location.replace('/app/' + window.location.search + window.location.hash);
        }
      })();
    </script>
    <link rel="stylesheet" href="./fonts.css" />
    <style id="expo-reset">
      * {
        -webkit-tap-highlight-color: transparent !important;
      }
      input,
      textarea,
      select,
      button,
      [contenteditable],
      [tabindex],
      [data-focusable="true"],
      [role="textbox"] {
        outline: none !important;
        outline-width: 0 !important;
        outline-style: none !important;
        outline-color: transparent !important;
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
        -webkit-tap-highlight-color: transparent !important;
        -webkit-focus-ring-color: transparent !important;
      }
      input:focus,
      input:focus-visible,
      input:active,
      textarea:focus,
      textarea:focus-visible,
      textarea:active,
      [data-focusable="true"]:focus,
      [data-focusable="true"]:focus-visible,
      [role="textbox"]:focus,
      [role="textbox"]:focus-visible,
      *:focus,
      *:focus-visible,
      *:focus-within {
        outline: none !important;
        outline-width: 0 !important;
        outline-style: none !important;
        outline-color: transparent !important;
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
        -webkit-focus-ring-color: transparent !important;
      }
      input:-webkit-autofill,
      input:-webkit-autofill:hover, 
      input:-webkit-autofill:focus, 
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px #14151D inset !important;
        -webkit-text-fill-color: #FFFFFF !important;
        caret-color: #FFFFFF !important;
        transition: background-color 5000s ease-in-out 0s;
      }
      html,
      body {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        background-color: #090A0D !important;
        overflow-x: hidden;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        user-select: none;
      }
      body {
        overflow: hidden;
      }
      #root {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        max-width: 100vw;
        flex: 1;
        overflow: hidden;
        background-color: #090A0D !important;
      }
    </style>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script src="./_expo/static/js/web/${jsFiles[0]}" defer></script>
  </body>
</html>`;
fs.writeFileSync(htmlPath, html);
console.log('Updated index.html');

// 4. Copy to android-builder and admin-web
const targetDirs = [
  path.resolve(__dirname, '../android-builder/assets/www'),
  path.resolve(__dirname, '../admin-web/public/app'),
  path.resolve(__dirname, '../admin-web/dist/app'),
];

for (const target of targetDirs) {
  console.log('Copying to:', target);
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(distDir, target, { recursive: true });
}

// ALSO Copy _expo and fonts.css to admin-web root so requests from /app (no trailing slash) succeed immediately!
const rootPublic = path.resolve(__dirname, '../admin-web/public');
const rootDist = path.resolve(__dirname, '../admin-web/dist');
fs.cpSync(path.join(distDir, 'fonts.css'), path.join(rootPublic, 'fonts.css'));
fs.cpSync(path.join(distDir, 'fonts.css'), path.join(rootDist, 'fonts.css'));
fs.cpSync(path.join(distDir, '_expo'), path.join(rootPublic, '_expo'), { recursive: true });
fs.cpSync(path.join(distDir, '_expo'), path.join(rootDist, '_expo'), { recursive: true });
console.log('Synced _expo and fonts.css to admin-web root as well!');
console.log('Sync complete!');
