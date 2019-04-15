// flow
import os           from 'os';
import dgram        from 'dgram';
import EventEmitter from 'events';
import NeDB         from 'nedb';
import uuidv4       from 'uuid/v4';
import { address }  from './ip';

const debug = require('debug')('SSDP');
const db    = new Datastore({ filename: './ssdp.db', autoload: true });

// UPnP STANDARD VARIABLES
const SSDP_ADDRESS    = '239.255.255.250';
const SSDP_PORT       = 1900;
const SSDP_HOST       = SSDP_ADDRESS + ':' + SSDP_PORT;
const TTL             = 2;
const MX              = 2;
const ALIVE_INTERVAL  = 1800 * 1000; // 30 minutes
const MAX_AGE         = 'max-age=1800';
const SERVER          = os.type() + '/' + os.release() + ' UPnP/1.1 kami/1.0.0';
export const LOCAL_IP = address();

// START LINES
const NOTIFY   = 'NOTIFY * HTTP/1.1\r\n';
const M_SEARCH = 'M-SEARCH * HTTP/1.1\r\n';
const OK       = 'HTTP/1.1 200 OK\r\n';

// NTS message headers
const ALIVE    = 'ssdp:alive';
const BYEBYE   = 'ssdp:byebye';
const UPDATE   = 'ssdp:update';
const DISCOVER = '"ssdp:discover"';

export type Type = 'NOTIFY' | 'M_SEARCH' | 'OK';

export type Options = {
  extraHeaders: Headers;
};

export type Headers = {
  [string]: string
};

export type Message = {
  type: Type,
  header: Headers
};

export type Peer = {
  port: number,
  address: string
};

class SSDP extends EventEmitter {
  udpSocket:        dgram;
  discoveryHandler: SetInterval;
  UUID:             string;
  BOOT_ID:          number; // CONFIG_ID:  0 to 16777215
  extraHeaders:     Headers;
  constructor(options: Options) {
    super();
    debug('instantiating SSDP module');
    self.BOOT_ID = 0;
    self.extraHeaders = options.extraHeaders;
    self.getPersistantData(); // grab all necessary variables and then it will call 'createSocket'
    self.setDiscoveryInterval();
  }

  getPersistantData() {
    const self = this;
    db.findOne({ key: 'UUID' }, (err, doc) => {
      if (!err && doc)
        self.UUID = doc.UUID;
      if (!self.UUID) {
        self.UUID = uuidv4();
        db.insert({ key: 'UUID', UUID: self.UUID });
      }
      self.createSocket();
    });
  }

  setDiscoveryInterval() {
    const self = this;
    discoveryHandler = SetInterval(() => {
      self.emit('DISCOVER');
    }, Math.floor(ALIVE_INTERVAL * 3 / 4));
  }

  createSocket() {
    debug('creating udp socket');
    const self = this;

    self.udpSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    self.udpSocket.on('message', self._onMessage);
    self.udpSocket.on('listening', self._onListening);
    self.udpSocket.on('error', self._onError);
    self.udpSocket.on('close', self._onClose);
    self.udpSocket.bind(SSDP_PORT, LOCAL_IP, () => {
      self.udpSocket.setMulticastTTL(TTL);
      self.udpSocket.setBroadcast(true);
      self.udpSocket.addMembership(SSDP_ADDRESS, LOCAL_IP);
      self.udpSocket.setMulticastLoopback(true);
    });
  }

  notify(headers: Headers, callback: Function) {
    debug('notify');
    headers.HOST   = headers.HOST || SSDP_HOST;
    headers.EXT    = headers.EXT || '';
    headers.SERVER = headers.SERVER || SERVER;
    headers.USN    = headers.USN || self.UUID;
    headers['CACHE-CONTROL'] = headers['CACHE-CONTROL'] || MAX_AGE;
    // headers['SEARCHPORT.UPNP.ORG'] = headers['SEARCHPORT.UPNP.ORG'] || SSDP_PORT; // optional (1900 default) - ports allowed 49152-65535
    for (let key in this.extraHeaders)
      headers[key] = this.extraHeaders[key];

    let msg = new Buffer(this._serialize(NOTIFY, headers));
    this.udpSocket.send(msg, 0, SSDP_PORT, SSDP_ADDRESS, callback);
  }

  alive(headers: Headers, callback: Function) {
    debug('alive');
    headers.NTS = ALIVE;
    this.notify(headers, callback);
  }

  byebye(headers: Headers, callback: Function) {
    debug('byebye');
    headers.NTS = BYEBYE;
    this.notify(headers, callback);
  }

  update(headers: Headers, callback: Function) {
    debug('update');
    headers.NTS = UPDATE;
    // set new boot_id
    BOOT_ID++;
    if (BOOT_ID >= 16777215)
      BOOT_ID = 0;
    // set new boot headers
    headers['BOOTID.UPNP.ORG']     = headers['BOOTID.UPNP.ORG'] || BOOT_ID - 1;
    headers['NEXTBOOTID.UPNP.ORG'] = headers['NEXTBOOTID.UPNP.ORG'] || BOOT_ID;
    this.notify(headers, callback);
  }

  search(headers: Headers, callback: Function) {
    debug('search');
    // prep headers
    headers.HOST = headers.HOST || SSDP_HOST;
    headers.MAN  = DISCOVER;
    headers.MX   = headers.MX || MX;
    headers.USN  = headers.USN || self.UUID;
    for (let key in this.extraHeaders)
      headers[key] = this.extraHeaders[key];

    let msg = new Buffer(this._serialize(M_SEARCH, headers));
    this.udpSocket.send(msg, 0, SSDP_PORT, SSDP_ADDRESS, callback);
  }

  reply(headers: Headers, peer: Peer, callback: Function) {
    debug('reply');
    headers.HOST = headers.HOST || SSDP_HOST;
    headers.EXT  = headers.EXT || '';
    headers['CACHE-CONTROL'] = headers['CACHE-CONTROL'] || MAX_AGE;
    // headers['SEARCHPORT.UPNP.ORG'] = headers['SEARCHPORT.UPNP.ORG'] || SSDP_PORT; // optional (1900 default) - ports allowed 49152-65535

    const msg = new Buffer(this._serialize(OK, headers));
    this.udpSocket.send(msg, 0, peer.port, peer.address, callback);
  }

  _onMessage(message: string, peer: { address: string, port: number }) {
    const { type, headers } = this._deserialize(message);
    debug('message - length: %d, type: %s', message.length, type);
    self.emit('message', type, headers, peer);
  }

  _onListening() {
    debug('listening');
    self.emit('listening');
  }

  _onError(err) {
    debug('Error:  %o', err);
    self.emit('err', err);
  }

  _onClose(err) {
    debug('Close error:  %o', err);
    self.emit('close', err);
  }

  _serialize(type: Type, headers: Headers): string {
    debug('serializing message of type \'%s\'', type);
    let result = type;

    for (let key in headers)
      result += key + ': ' + headers[key] + '\r\n';
    result += '\r\n';

    return result;
  }

  _deserialize(msg: string): Message {
    debug('deserializing message');
    const lines = msg.toString().split('\r\n');
    let type = lines.shift().trim();
    let headers = {};

    // First let's parse the type
    if (type === OK.trim())
      type = 'OK';
    else if (type === NOTIFY.trim())
      type = 'NOTIFY';
    else if (type === M_SEARCH.trim())
      type = 'M_SEARCH';

    // Now grab all the headers
    lines.forEach(line => {
      line = line.trim().split(': ');
      if (line.length && line.length >= 2)
        headers[line[0]] = headers[line[1]];
    });

    return {type, headers};
  }
}

export default SSDP;
