import { EventEmitter } from 'node:events';
import TypedEmitter from 'typed-emitter';
import { Server, Socket, createServer } from 'node:net';

export default class ReadOnlyProxy extends (EventEmitter as new () => TypedEmitter<ReadOnlyProxyEvents>) {
  private readonly options: ReadOnlyProxyOptions;
  private readonly sockets: ReadOnlyProxySocketMap[];
  private readonly server: Server;

  /**
   * Create a new read only proxy. Read only proxies are proxies where you can only read packets
   * @param options The options for the proxy
   */
  public constructor(options: ReadOnlyProxyOptions = {}) {
    super();
    this.options = options;

    this.sockets = [];

    this.server = createServer();
    this.server.listen(options.port ?? 25565, options.hostname);

    this.server.once('listening', () => {
      this.emit('raw_listening', this.server);
      this.debug('Listening addr=', this.server.address());
    });

    this.server.on('connection', (socket: Socket) => {
      this.emit('raw_connect', socket);
      this.debug('New connection from', socket.remoteAddress);

      const internalSocket = new Socket();
      this.sockets.push({
        socket: socket,
        internal: internalSocket,
      });

      // Handle errors
      socket.on('close', (hadError) => {
        this.emit('raw_disconnect', socket, hadError);
        internalSocket.end();
      });
      internalSocket.on('close', () => socket.end());

      // Connect the internalSocket to the target server
      internalSocket.connect(
        options.serverPort ?? 25565,
        options.serverHostname
      );

      // Forward data
      socket.on('data', (data) => {
        internalSocket.write(data);
        this.emit('outgoing_data', data, socket, internalSocket);
      });
      internalSocket.on('data', (data) => {
        socket.write(data);
        this.emit('incoming_data', data, socket, internalSocket);
      });
    });

    this.server.on('close', () => this.emit('raw_close'));
    this.server.on('error', (error) => this.emit('error', 'server', error));
  }

  private debug(...args) {
    if (this.options.debug) console.log('[DEBUG]', ...args);
  }
}

type ErrorOrigin = 'server' | 'internal';

type ReadOnlyProxyEvents = {
  raw_listening: (server: Server) => void;
  raw_connect: (socket: Socket) => void;
  raw_disconnect: (socket: Socket, hadError: boolean) => void;
  raw_close: () => void;
  error: (origin: ErrorOrigin, error: Error) => void;
  outgoing_data: (data: Buffer, socket: Socket, internal: Socket) => void;
  incoming_data: (data: Buffer, socket: Socket, internal: Socket) => void;
};

type ReadOnlyProxySocketMap = {
  /** The real socket (the minecraft client, the user), the one connected to the proxy */
  socket: Socket;
  /** The proxy socket, the one connected to the target server */
  internal: Socket;
};

interface ReadOnlyProxyOptions {
  /** Port to listen on, defaults to `25565` */
  port?: number;
  /** Hostname to bind to */
  hostname?: string;
  /** Whether or not to enable debugging */
  debug?: boolean;
  /** Target server port, defaults to `25565` */
  serverPort?: number;
  /** Target server hostname */
  serverHostname?: string;
}
