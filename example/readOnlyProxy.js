const { ReadOnlyProxy } = require('../dist');

const proxy = new ReadOnlyProxy({
  debug: true,
  serverHostname: 'localhost',
  port: 8080,
});

proxy.on('incoming_data', (data) => {
  console.log('[INCOMING]', data);
});

proxy.on('outgoing_data', (data) => {
  console.log('[OUTGOING]', data);
});
