#!/bin/sh

for envfile in .env .env.local .env.production .env.production.local; do
  if [ -f "/usr/local/etc/kippenstummel/kmc/$envfile" ]; then
    ln -sf "/usr/local/etc/kippenstummel/kmc/$envfile" "/usr/local/bin/kippenstummel/kmc/$envfile"
  fi
done

exec node server.js
