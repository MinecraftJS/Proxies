# Proxies

Create proxies for Minecraft

# Documentation

## Installation

Install the package:

```bash
$ npm install @minecraft-js/proxies
```

And then import it in your JavaScript/TypeScript file

```ts
const Proxies = require('@minecraft-js/proxies'); // CommonJS

import * as Proxies from '@minecraft-js/proxies'; // ES6
```

## Read only proxies

Read only proxies are proxies where you can only read packets.
Create a read only proxy like so

```js
const proxy = new Proxies.ReadOnlyProxy({
  serverHostname: 'localhost', // Target server hostname
  port: 8080, // Proxy port
});
```

And then you can use the `ReadOnlyProxy#on` method to listen for different events:

- `raw_listening` - When the TCP server is listening
- `raw_connect` - When a client opens a connection
- `raw_disconnect` - When a client closes a connection
- `raw_close` - When the TCP server is closed
- `error` - When an error occurs
- `outgoing_data` - When data is sent to the target server
- `incoming_data` - When data is received from the target server

# Using TypeScript?

If you are using TypeScript or you want type checking make sure to install the `typed-emitter` package!

```bash
$ npm install typed-emitter
```
