const Config = require("../../utils/config.js");
const Constants = require("../../constants.js");

const DEPLOYMENT_CONSTRAINTS_TABLE = "deployment_constraints";

exports.up = function(knex) {

  const constraints = [
    {
      entity_type: Constants.ENTITY_SYSTEM,
      defaults: JSON.stringify({
        "workers": {
          "resources": {
            "limits": {
              "cpu": "4",
              "memory": "8192Mi"
            },
            "requests": {
              "cpu": "500m",
              "memory": "1024Mi"
            }
          },
          "replicas": 1,
          "terminationGracePeriodSeconds": 600
        },
        "scheduler": {
          "resources": {
            "limits": {
              "cpu": "500m",
              "memory": "1024Mi"
            },
            "requests": {
              "cpu": "100m",
              "memory": "256Mi"
            }
          }
        },
        "webserver": {
          "resources": {
            "limits": {
              "cpu": "500m",
              "memory": "1024Mi"
            },
            "requests": {
              "cpu": "100m",
              "memory": "256Mi"
            }
          }
        },
        "flower": {
          "resources": {
            "limits": {
              "cpu": "500m",
              "memory": "1024Mi"
            },
            "requests": {
              "cpu": "100m",
              "memory": "256Mi"
            }
          }
        },
        "statsd": {
          "resources": {
            "limits": {
              "cpu": "500m",
              "memory": "1024Mi"
            },
            "requests": {
              "cpu": "100m",
              "memory": "256Mi"
            }
          }
        },
        "pgbouncer": {
          "metadataPoolSize": 2,
          "resultBackendPoolSize": 1,
          "resources": {
            "limits": {
              "cpu": "500m",
              "memory": "1024Mi"
            },
            "requests": {
              "cpu": "100m",
              "memory": "256Mi"
            }
          }
        },
        "redis": {
          "resources": {
            "limits": {
              "cpu": "500m",
              "memory": "1024Mi"
            },
            "requests": {
              "cpu": "100m",
              "memory": "256Mi"
            }
          }
        },
        "quotas": {
          "pods": 100,
          "requests": {
            "cpu": "3",
            "memory": "12Gi"
          },
          "limits": {
            "cpu": "5",
            "memory": "20Gi"
          }
        },
        "limits": [{
          "type": "Pod",
          "max": {
            "cpu": "4",
            "memory": "8192Mi"
          }
        }, {
          "type": "Container",
          "default": {
            "cpu": "100m",
            "memory": "256Mi"
          },
          "defaultRequest": {
            "cpu": "100m",
            "memory": "256Mi"
          },
          "min": {
            "cpu": "100m",
            "memory": "128Mi"
          }
        }]
      }),
      limits: JSON.stringify({
        "workers": {
          "resources": {
            "limits": {
              "cpu": "4",
              "memory": "8192Mi"
            },
            "requests": {
              "cpu": "500m",
              "memory": "1024Mi"
            }
          },
          "replicas": 10,
          "terminationGracePeriodSeconds": 86400
        },
        "scheduler": {
          "resources": {
            "limits": {
              "cpu": "500m",
              "memory": "1024Mi"
            },
            "requests": {
              "cpu": "100m",
              "memory": "256Mi"
            }
          }
        },
        "webserver": {
          "resources": {
            "limits": {
              "cpu": "500m",
              "memory": "1024Mi"
            },
            "requests": {
              "cpu": "100m",
              "memory": "256Mi"
            }
          }
        },
        "flower": {
          "resources": {
            "limits": {
              "cpu": "500m",
              "memory": "1024Mi"
            },
            "requests": {
              "cpu": "100m",
              "memory": "256Mi"
            }
          }
        },
        "statsd": {
          "resources": {
            "limits": {
              "cpu": "500m",
              "memory": "1024Mi"
            },
            "requests": {
              "cpu": "100m",
              "memory": "256Mi"
            }
          }
        },
        "pgbouncer": {
          "metadataPoolSize": 2,
          "resultBackendPoolSize": 1,
          "resources": {
            "limits": {
              "cpu": "500m",
              "memory": "1024Mi"
            },
            "requests": {
              "cpu": "100m",
              "memory": "256Mi"
            }
          }
        },
        "redis": {
          "resources": {
            "limits": {
              "cpu": "500m",
              "memory": "1024Mi"
            },
            "requests": {
              "cpu": "100m",
              "memory": "256Mi"
            }
          }
        },
        "quotas": {
          "pods": 100,
          "requests": {
            "cpu": "3",
            "memory": "12Gi"
          },
          "limits": {
            "cpu": "5",
            "memory": "20Gi"
          }
        },
        "limits": [{
          "type": "Pod",
          "max": {
            "cpu": "4",
            "memory": "8192Mi"
          }
        }, {
          "type": "Container",
          "default": {
            "cpu": "100m",
            "memory": "256Mi"
          },
          "defaultRequest": {
            "cpu": "100m",
            "memory": "256Mi"
          },
          "min": {
            "cpu": "100m",
            "memory": "128Mi"
          }
        }]
      }),
      created_at: new Date().toISOString(),
    },
  ];

  return knex(DEPLOYMENT_CONSTRAINTS_TABLE).insert(constraints);
};

exports.down = function(knex) {
};
