# Operation

The Kippenstummel KMC is generally operated on-premise. Because it is written
with [Next.js](https://nextjs.org/) as SSR (Server Side Rendering) application, it
requires a proper [Node.js](https://nodejs.org/) runtime environment to run.

## System Environment

The web client has almost zero dependencies to third-party services and is
operated on-premise. The only external service the web client relies on is
obviously the [Kippenstummel API](https://github.com/MuellerConstantin/kippenstummel-api)
service itself. Therefore, this service must be present and available for
communication.

**[Keycloak](https://www.keycloak.org/)**

Because the web client requires authentication, a [Keycloak](https://www.keycloak.org/)
authentication server must be present and available for communication. Technically,
other OAuth2 providers could work as well, but this is not officially supported.

## Deployment

The web client can be deployed on any [Node.js](https://nodejs.org/) runtime
environment matching the version required in the [package.json](/package.json)
file. For a proper deployment, the application must also be configured properly
(See [Configuration](./configuration.md)). The application can run either as
system software (standalone) or in a container. Depending on this, either
Docker or a the Node.js runtime environment is required.

### Container

The application can also be run in a container using the provided or self-built
Docker image. This does not require a Node.js installation on the target system,
but an installation of the Docker Engine.

Even with container deployment, the application still has to be configured. This
is basically the same as for standalone operation. For configuration details
see [configuration](./configuration.md).

The release in the form of a Docker image can be started as follows:

```shell
docker run -d -p 3000:3000 -v <CONFIG_PATH>:/usr/local/etc/kippenstummel/kmc kippenstummel/kmc:<VERSION>
```

#### Build image

Should it be necessary in the development phase or for other reasons to build
the Docker image directly from the source code, this is also possible. No Node.js
installations are required for this either, the image is built in multi-stage
operation on a Docker basis. The provided Dockerfile can be used to build:

```shell
docker build -t kippenstummel/kmc:<VERSION> .
```

### Standalone

Because the web client is written with [Next.js](https://nextjs.org/) as SSR
(Server Side Rendering) application, for a standalone deployment, the web client
must be deployed with [Node.js](https://nodejs.org/) runtime environment. Also the
[npm](https://www.npmjs.com/) package manager might be helpful for installing
dependencies and executing the web client.

For a custom configured deployment, a rebuild of the application is required. This
especially applies to web client configuration settings
(See [Configuration](./configuration.md)) like API endpoints and other settings
because these variables are loaded and hardcoded at build time.

For building the application, the [npm](https://www.npmjs.com/) package manager
can be used. First of all the required dependencies need to be installed:

```shell
npm install
```

Then the application can be built:

```shell
npm run build
```

For running the built application, the [npm](https://www.npmjs.com/) package manager
can also be used.

```shell
npm run start
```
