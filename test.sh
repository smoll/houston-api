export HOUSTON_POSTGRES_URI=postgres://houston:houston@localhost:6432/houston
export AIRFLOW_POSTGRES_URI=postgres://houston:houston@localhost:6432/houston
export DEBUG_DB=false

if [ -z "$1" ]; then
    ./node_modules/.bin/jest unit
else
    ./node_modules/.bin/jest $1
fi