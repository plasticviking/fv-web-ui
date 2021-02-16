FROM nuxeo:10.10

COPY nuxeo.conf /docker-entrypoint-initnuxeo.d/nuxeo.conf
COPY setup.sh /docker-entrypoint-initnuxeo.d/setup.sh

USER root

RUN echo "deb http://httpredir.debian.org/debian jessie non-free" >> /etc/apt/sources.list
RUN apt-get update && apt-get install -y --no-install-recommends vim

COPY initialsetup.sh /opt/nuxeo/server/tmp/
RUN ["chmod", "+x", "/opt/nuxeo/server/tmp/initialsetup.sh"]

COPY nuxeo-diff-1.9.3 /opt/nuxeo/server/tmp/
COPY nuxeo-jsf-ui-10.10.0 /opt/nuxeo/server/tmp/
COPY nuxeo-platform-user-registration-1.9.4 /opt/nuxeo/server/tmp/
COPY saml2-authentication-1.4.3 /opt/nuxeo/server/tmp/


COPY firstvoices-marketplace-package-latest.zip /opt/nuxeo/server/tmp/
