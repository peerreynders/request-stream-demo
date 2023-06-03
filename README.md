# request-stream-demo
Demo from the article [Streaming requests with the fetch API](https://developer.chrome.com/articles/fetch-streaming-requests/) (on [glitch.com](https://glitch.com/~fetch-request-stream)) that works locally (i.e. via `localhost`).

For streaming requests to work the HTTP protocol needs to be HTTP/2, not HTTP/1.1. The glitch version works because the proxy server handles HTTP/2 (and of course HTTPS). However to run the code locally some additional modifications are needed.

Modifications:
- Replaced Express with [Polka](https://github.com/lukeed/polka) (which supports HTTP/2 without a bridge)
- Wrapped server in [createSecureServer](https://nodejs.org/api/http2.html#http2createsecureserveroptions-onrequesthandler)
- Updated `server.js` to ESM
- *Warning*: The certificate and public key files `localhost.pem` and `localhost-key.pem` need to be present.
