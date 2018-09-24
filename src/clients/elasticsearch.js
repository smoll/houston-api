const Config = require("../utils/config.js");

const elasticsearch = require("elasticsearch");

class ElasticsearchClient {

  // host ex localhost:9200
  constructor(host) {
    this.client = new elasticsearch.Client({
      host: host,
      log: "trace",
    });
  }

  async search(component, workspace, release) {
    try {

      // TODO: drop in elasticsearch search call
      // TODO: await
      console.log("performing elasticsearch search...");
      // // updated to match greg"s 8/1/18
      // const payload = {
      //   component: "scheduler",
      //   workspace: "my-workspace-id",
      //   release: "my-release",
      //   log: "scheduler test log line",
      // };

      // TODO: dynamic timestamps... how?
      // TODO: make timestamp offset dynamic with polling or something
      // https://stackoverflow.com/questions/32619909/elasticsearch-query-based-on-timestamp
      // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html

      const timestampStart = "2015-08-04T11:00:00";
      const timestampEnd = "2015-08-04T12:00:00";

      let i = 0;
      while (true) {
        // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html
        // https://stackoverflow.com/questions/34927083/issue-getting-the-latest-elasticsearch-entry-every-x-seconds
        const response = await this.client.search({
          // index: "???",
          // type: "???",
          // size: 3,
          _sort: "@timestamp:desc",
          body: {
            query: {
              match: {
                // TODO: release name etc here?
              }
              range: {
                "@timestamp": {
                  gte: timestampStart,
                  lt: timestampEnd
                }
              }
            },
          }
        });
        i += 1;
        if (i === 3) {
          break;
        }
      }

      console.log("post loop");

      const x = this.client.ping({
        requestTimeout: 2000,
      }, (err) => {
        if (err) {
          console.trace("elasticsearch down", err);
        } else {
          console.log("all good");
        }
      });

      const results = "...";

      return {
        results: results
      };

    } catch (err) {
      console.log(`Error fetching deployment logs for ${release}`);
      console.log(err.message);
      return {};
    }
  }

}

module.exports = ElasticsearchClient;
