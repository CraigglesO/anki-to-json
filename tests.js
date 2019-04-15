const SSDP = require('./lib').default;

const ssdp = new SSDP();

ssdp.on('listening', () => {
  console.log('listening!');
});

ssdp.on('OK', (headers, peer) => {
  console.log();
  console.log('OK');
  console.log('headers', headers);
  console.log('peer', peer);
  console.log();
});

ssdp.on('NOTIFY', (headers, peer) => {
  console.log();
  console.log('NOTIFY');
  console.log('headers', headers);
  console.log('peer', peer);
  console.log();
});

ssdp.on('M_SEARCH', (headers, peer) => {
  console.log();
  console.log('M_SEARCH');
  console.log('headers', headers);
  console.log('peer', peer);
  console.log();
});
