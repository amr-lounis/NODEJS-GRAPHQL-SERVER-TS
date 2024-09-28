@echo off

rem Generate a private key:
openssl genpkey -algorithm RSA -out private.key -pkeyopt rsa_keygen_bits:2048

rem Generate a certificate signing request (CSR):
openssl req -new -key private.key -out request.csr -config _auto.openssl.conf

rem Generate a self-signed certificate (Optional):
openssl x509 -req -days 3650 -in request.csr -signkey private.key -out certificate.crt -extensions v3_req -extfile _auto.openssl.conf
