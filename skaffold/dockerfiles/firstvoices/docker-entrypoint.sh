#!/bin/bash
set -e
cp /opt/injected_config/nuxeo.conf /etc/nuxeo/nuxeo.conf
cp /opt/injected_config/log4j2.xml /opt/nuxeo/server/lib/log4j2.xml


NUXEO_DATA=${NUXEO_DATA:-/var/lib/nuxeo/data}
NUXEO_LOG=${NUXEO_LOG:-/var/log/nuxeo}
NUXEO_FORCE_CONF=${NUXEO_FORCE_CONF:-false}
NUXEO_MPINSTALL_OPTIONS=${NUXEO_MPINSTALL_OPTIONS:---relax=false}


if [ "$1" = 'nuxeoctl' ]; then

  for f in /docker-entrypoint-initnuxeo.d/*; do
    case "$f" in
      *.sh)  echo "$0: running $f"; . "$f" ;;
      *.zip) echo "$0: installing Nuxeo package $f"; nuxeoctl mp-install $f ${NUXEO_MPINSTALL_OPTIONS} --accept=true ;;
      *.clid) echo "$0: copying clid to $NUXEO_DATA"; cp $f $NUXEO_DATA/ ;;
      # Special case for nuxeo.conf handled above, don't log
      *nuxeo.conf) ;;
      *)     echo "$0: ignoring $f" ;;
    esac
  done

  # instance.clid
  if [ -n "$NUXEO_CLID" ]; then
    # Replace --  by a carriage return
    NUXEO_CLID="${NUXEO_CLID/--/\\n}"
    printf "%b\n" "$NUXEO_CLID" >> $NUXEO_DATA/instance.clid
  fi

  ## Executed at each start
  if [ -n "$NUXEO_CLID"  ] && [ ${NUXEO_INSTALL_HOTFIX:='true'} == "true" ]; then
      nuxeoctl mp-hotfix --accept=true
  fi

  # Install packages if exist
  if [ -n "$NUXEO_PACKAGES" ]; then
    nuxeoctl mp-install $NUXEO_PACKAGES $NUXEO_MPINSTALL_OPTIONS --accept=true
  fi

fi

exec "$@"
