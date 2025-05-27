# Configuration

In order to operate the service successfully, a number of configurations are required.
Even if the web client is written as SSR (Server Side Rendering) application, the
required configuration is almost zero. Basically, we differ between two diffent types
of configurations: Build time configuration, intended to be used by the actual web client,
and runtime configuration, intended to be used by the frontend's web server responsible
for serving the web client using SSR.

Both types of configurations are defined using environment variables or as alternative
using so called environment files. If you decide to configure the service using a
config file, the service expects a file called `.env` in the project's root directory.

---

**NOTE**

The configuration of the web client is based on the technical possibilities of
[Next.js](https://nextjs.org/), see
[Next.js Environment Variables](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables).
In order to keep the configuration of the service as simple and straightforward as possible,
Kippenstummel KMC abstracts the configuration process and only uses a part of what is technically
possible. Nevertheless, the technical principles of the Next.js still apply and are mentioned
here for the sake of completeness.

---

## Configuration Options

### Build time configuration

Build time configuration variables are in general prefixed with `NEXT_PUBLIC_`. Changing these variables
requires a rebuild of the web client. These variables are loaded and hardcoded at build time.

_None variables to configure._

### Runtime configuration

Runtime configuration variables are used by the frontend's web server responsible for serving the web client. Changing these variables
requires a restart of the web server.

| Environment Variable  | Description                                                                                                    | Required |
| --------------------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| KIPPENSTUMMEL_API_URL | Url of the Kippenstummel API. Including the api prefix and version. (e.g. `http://<HOST>:<PORT>/api/v1`)       | Yes      |
| NEXTAUTH_URL          | Url of the Kippenstummel KMC web client. (e.g. `http://<HOST>:<PORT>`). Used for redirects after OAuth2 login. | Yes      |
| NEXTAUTH_SECRET       | Secret used to encrypt the session cookie.                                                                     | Yes      |
| OAUTH2_ISSUER         | Issuer URL of the OAuth2 provider.                                                                             | Yes      |
| OAUTH2_TOKEN_URL      | Token endpoint of the OAuth2 provider.                                                                         | Yes      |
| OAUTH2_CLIENT_ID      | Client ID of the OAuth2 provider.                                                                              | Yes      |
| OAUTH2_CLIENT_SECRET  | Client secret of the OAuth2 provider.                                                                          | Yes      |
