#!/usr/bin/env bash

PASS=`cat mysql-pass`

mysql -u pathblock -h 10.42.0.1 -P 13306 --password=$PASS pathblock <<EOF
DROP TABLE IF EXISTS auth_tokens;
CREATE TABLE auth_tokens (token VARCHAR(36) PRIMARY KEY);
DROP TABLE IF EXISTS data;
CREATE TABLE data (
    token VARCHAR(36) REFERENCES auth_tokens ON DELETE CASCADE,
    name VARCHAR(128),
    value TEXT,
    PRIMARY KEY(token,name)
);
EOF