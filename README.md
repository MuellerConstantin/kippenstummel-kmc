# Kippenstummel KMC

> Administrative interface for Kippenstummel.

![](https://img.shields.io/badge/React-19-blue?logo=react)
![](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![](https://img.shields.io/badge/CSS%20Library-Tailwind%20CSS-blue?logo=tailwindcss)

![Banner](./docs/images/banner.svg)

## Table of contents

- [Introduction](#introduction)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [License](#license)
  - [Forbidden](#forbidden)

## Introduction

This is the browser based frontend of _Kippenstummel_ for administrators, an
application for collaboratively recording and retrieving the locations of
cigarette vending machines.

## Deployment

The frontend client is generally operated on-premise. Because it is written with
[Next.js](https://nextjs.org/) as SSR (Server Side Rendering) application, it
requires a proper runtime environment to run (See [Operation](docs/operation.md)).
Besides the runtime environment, there are a few configuration settings that need
to be set (See [Configuration](docs/configuration.md)).

## Architecture

Kippenstummel KMC is a web application based on SSG (Static Site Generation). The
following diagram shows the architecture of the application:

![Architecture Overview](./docs/images/architecture-overview.svg)

The application consists of three major parts:

- **Static File Server**: The static file server is responsible for serving the
  static files of the actual application, a multi-page application (MPA) built
  with [Next.js](https://nextjs.org/).
- **BFF Proxy**: The BFF (Backend For Frontend) proxy is responsible for proxying
  requests to the Kippenstummel API.

The actual web application is browser-based and therefore runs on the client. Required
dynamic data is fetched from the BFF proxy, which in turn proxies the requests to
the Kippenstummel API. For security reasons, the web application is secured by
[Keycloak](https://www.keycloak.org/) using OAuth2.

## License

Copyright (c) 2025 Constantin Müller

[GNU AFFERO GENERAL PUBLIC LICENSE](https://www.gnu.org/licenses/) or [LICENSE](LICENSE) for
more details.

### Forbidden

**Hold Liable**: Software is provided without warranty and the software
author/license owner cannot be held liable for damages.
