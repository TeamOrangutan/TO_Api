require('dotenv').config();
console.log({
  nodeVersion: process.version,
  paypalId: process.env.PAYPAL_CLIENT_ID ? 'Existe' : 'No existe',
  envKeys: Object.keys(process.env).filter(k => k.includes('PAYPAL'))
});