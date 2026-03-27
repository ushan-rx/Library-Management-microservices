#!/bin/sh
set -eu

for db in auth_db member_db category_db book_db borrow_db fine_db; do
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE ${db}'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${db}')\gexec
EOSQL
done
