const fs = require('fs');
const path = require('path');

const files = [
  path.resolve(__dirname, '../admin-web/public/app/_expo/static/js/web/AppEntry-b9e3c268af3c59752f19c56d94f9cba5.js'),
  path.resolve(__dirname, '../admin-web/public/_expo/static/js/web/AppEntry-b9e3c268af3c59752f19c56d94f9cba5.js'),
  path.resolve(__dirname, '../android-builder/assets/www/_expo/static/js/web/AppEntry-b9e3c268af3c59752f19c56d94f9cba5.js'),
];

const target = "const s=_e.CLOUD_API_BASE='https://capmusdriversproject.vercel.app/api',n=_e.LOCAL_WIFI_BASE='http://192.168.51.113:5001/api',c=_e.API_BASE='localhost'===window.location.hostname||'127.0.0.1'===window.location.hostname?'http://localhost:5001/api':s,l=t.default.create({baseURL:c,headers:{'Content-Type':'application/json'},timeout:1e4});_e.setAuthToken=e=>{e?l.defaults.headers.common.Authorization=`Bearer ${e}`:delete l.defaults.headers.common.Authorization},l.interceptors.request.use(async e=>{try{const t=await o.default.getItem('campus_drivers_token');t&&(e.headers.Authorization=`Bearer ${t}`)}catch(e){console.warn('Error reading token from AsyncStorage',e)}return e}),l.interceptors.response.use(e=>e,async e=>{const t=e.config;return!t||t._retry||500!==e.response?.status&&'ERR_NETWORK'!==e.code&&e.response||(t._retry=!0,t.baseURL!==s)?Promise.reject(e):(console.log('[API] Falling back to local WiFi backend:',n),t.baseURL=n,l.request(t))})";

const replacement = "const s=_e.CLOUD_API_BASE=(typeof window!=='undefined'&&window.location&&window.location.origin)?window.location.origin+'/api':'/api',n=_e.LOCAL_WIFI_BASE=(typeof window!=='undefined'&&window.location&&window.location.hostname)?'http://'+window.location.hostname+':5001/api':'http://localhost:5001/api',c=_e.API_BASE=(typeof window!=='undefined'&&window.location)?(window.location.port==='8081'||window.location.port==='19006'?n:(window.location.origin?window.location.origin+'/api':'/api')):'http://localhost:5001/api',l=t.default.create({baseURL:c,headers:{'Content-Type':'application/json'},timeout:15e3});_e.setAuthToken=e=>{e?l.defaults.headers.common.Authorization=`Bearer ${e}`:delete l.defaults.headers.common.Authorization},l.interceptors.request.use(async e=>{try{const t=await o.default.getItem('campus_drivers_token');t&&(e.headers.Authorization=`Bearer ${t}`)}catch(e){console.warn('Error reading token from AsyncStorage',e)}return e}),l.interceptors.response.use(e=>e,async e=>{const t=e.config;if(t&&!t._retry&&(e.code==='ERR_NETWORK'||!e.response)){t._retry=!0;if(typeof window!=='undefined'&&t.baseURL!==n&&window.location.port!=='5001'){console.log('[API] Retrying on backend port 5001:',n);t.baseURL=n;return l.request(t);}}return Promise.reject(e);})";

let count = 0;
for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      fs.writeFileSync(file, content);
      console.log('Successfully patched bundle:', file);
      count++;
    } else {
      console.warn('Target string not found in:', file);
    }
  } else {
    console.warn('File does not exist:', file);
  }
}

console.log(`Finished. Patched ${count} files.`);
