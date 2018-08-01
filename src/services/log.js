const BaseService = require("./base.js");
const sampleLogs = [
  '{models.py:4584} INFO - Updating state for <DagRun example_dag @ 2018-01-01 01:00:00: scheduled__2018-01-01T01:00:00, externally triggered: False> considering 12 task(s)',
  '{jobs.py:895} INFO - Examining DAG run <DagRun example_dag @ 2018-01-01 01:05:00: scheduled__2018-01-01T01:05:00, externally triggered: False>',
  '{dag_processing.py:468} INFO - Processor for /usr/local/airflow/dags/example_bash_operator.py finished',
  '{dag_processing.py:537} INFO - Started a process (PID: 1838) to generate tasks for /usr/local/airflow/dags/example_bash_operator.py',
  '{jobs.py:1662} INFO - Heartbeating the executor',
  '{jobs.py:368} INFO - Started process (PID=1838) to work on /usr/local/airflow/dags/example_bash_operator.py',
  '{jobs.py:1742} INFO - Processing file /usr/local/airflow/dags/example_bash_operator.py for tasks to queue',
  '{models.py:189} INFO - Filling up the DagBag from /usr/local/airflow/dags/example_bash_operator.py',
  '{jobs.py:1754} INFO - DAG(s) dict_keys([`example_bash_operator]) retrieved from /usr/local/airflow/dags/example_bash_operator.py',
  '{models.py:341} INFO - Finding running jobs without a recent heartbeat',
  '{models.py:345} INFO - Failing jobs without heartbeat after 2018-07-26 17:19:25.267642',
  '{jobs.py:375} INFO - Processing /usr/local/airflow/dags/example_bash_operator.py took 0.036 seconds',
  'Waiting for host: postgres:5432',
  'Initializing airflow database...',
  `____________       _____________
____    |__( )_________  __/__  /________      __
____  /| |_  /__  ___/_  /_ __  /_  __ \_ | /| / /
___  ___ |  / _  /   _  __/ _  / / /_/ /_ |/ |/ /
_/_/  |_/_/  /_/    /_/    /_/  \____/____/|__/`,
  '{__init__.py:45} INFO - Using executor LocalExecutor',
  '{models.py:189} INFO - Filling up the DagBag from /usr/local/airflow/dags',
  '172.19.0.1 - "GET / HTTP/1.1" 302 221 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.68 Safari/537.36"',
]

class LogService extends BaseService {

  getRandomLog(date) {
      return {
        uuid: Math.random().toString(36).substring(2, 15),
        log: sampleLogs[Math.floor(Math.random() * sampleLogs.length)],
        createdAt: date || new Date(),
      }
    }

    getLogs(startDate) {
      const logs = []
      let next = startDate.getTime() / 1000
      const pushLog = () => {
        next += Math.floor(Math.random() * 300)
        logs.push(this.getRandomLog(new Date(next * 1000)))

        if (next <= (new Date()).getTime() / 1000) pushLog()
      }
      pushLog()
      return logs
    }
}

module.exports = LogService;
