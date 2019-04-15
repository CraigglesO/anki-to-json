import os from 'os';
// CREDIT: https://github.com/indutny/node-ip/blob/master/lib/ip.js

function _normalizeFamily(family) {
  return family ? family.toLowerCase() : 'ipv4';
}

function isLoopback(addr) {
  return /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/.test(addr)
    || /^fe80::1$/.test(addr)
    || /^::1$/.test(addr)
    || /^::$/.test(addr);
}

function loopback(family) {
  // Default to `ipv4`
  family = _normalizeFamily(family);

  if (family !== 'ipv4' && family !== 'ipv6')
    throw new Error('family must be ipv4 or ipv6');

  return family === 'ipv4' ? '127.0.0.1' : 'fe80::1';
}

function isPrivate(addr) {
  return /^(::f{4}:)?10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr)
    || /^(::f{4}:)?192\.168\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr)
    || /^(::f{4}:)?172\.(1[6-9]|2\d|30|31)\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr)
    || /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr)
    || /^(::f{4}:)?169\.254\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr)
    || /^f[cd][0-9a-f]{2}:/i.test(addr)
    || /^fe80:/i.test(addr)
    || /^::1$/.test(addr)
    || /^::$/.test(addr);
}

function isPublic(addr) {
  return !isPrivate(addr);
}

export function address(name, family) {
  const interfaces = os.networkInterfaces();

  // Default to `ipv4`
  family = _normalizeFamily(family);

  // If a specific network interface has been named return the address.
  if (name && name !== 'private' && name !== 'public') {
    let res = interfaces[name].filter(function(details) {
      return details.family.toLowerCase() === family;
    });
    if (res.length === 0)
      return undefined;
    return res[0].address;
  }

  let all = Object.keys(interfaces).map((nic) => {
    // Note: name will only be `public` or `private` when this is called.
    const addresses = interfaces[nic].filter((details) => {
      details.family = details.family.toLowerCase();
      if (details.family !== family || isLoopback(details.address))
        return false;
      else if (!name)
        return true;

      return name === 'public' ? isPrivate(details.address) : isPublic(details.address);
    });

    return addresses.length ? addresses[0].address : undefined;
  }).filter(Boolean);

  return !all.length ? loopback(family) : all[0];
};
