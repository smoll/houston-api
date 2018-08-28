const Base = require("./base.js");

const DotObject = require("../dot_object.js");
class ConstraintAirflow extends Base {
  get(asDotObject = false) {
    if (asDotObject) {
      return new DotObject(this.config);
    }
    return this.config;
  }

  build() {
    this.calculateQuotas();
    this.calculateLimits();
    return this.config;
  }

  calculateQuotas() {
    // for(let component of ConstraintAirflow.COMPONENTS) { ...
    this.config.quotas = {
      pods: 100,
      requests: {
        cpu: "3",
        memory: "12Gi",
      },
      limits: {
        cpu: "5",
        memory: "20Gi",
      }
    }
  }

  calculateLimits() {
    // for(let component of ConstraintAirflow.COMPONENTS) { ...

    this.config.limits = [
      {
        type: "Pod",
        max: this.initBlock(4000, 8192)
      },
      {
        type: "Container",
        default: this.initBlock(100, 256),
        defaultRequest: this.initBlock(100, 256),
        min: this.initBlock(100, 128),
      }
    ]
  }

  initialize() {
    this.config = {
      workers: {
        resources: this.initResourceByValue(4000, 8192, 500, 1024),
        replicas: 1,
        terminationGracePeriodSeconds: 600,
      },
      scheduler: {
        resources: this.initResourceByValue(500, 1024, 100, 256),
      },
      webserver: {
        resources: this.initResourceByValue(500, 1024, 100, 256),
      },
      flower: {
        resources: this.initResourceByValue(500, 1024, 100, 256),
      },
      statsd: {
        resources: this.initResourceByValue(500, 1024, 100, 256),
      },
      redis: {
        resources: this.initResourceByValue(500, 1024, 100, 256),
      }
    };

    return this.build();
  }
}

ConstraintAirflow.COMPONENT_SCHEDULER = "scheduler";
ConstraintAirflow.COMPONENT_WEBSERVER = "webserver";
ConstraintAirflow.COMPONENT_FLOWER = "flower";
ConstraintAirflow.COMPONENT_STATSD = "statsd";
ConstraintAirflow.COMPONENT_REDIS = "redis";

ConstraintAirflow.COMPONENTS = [
  ConstraintAirflow.COMPONENT_SCHEDULER,
  ConstraintAirflow.COMPONENT_WEBSERVER,
  ConstraintAirflow.COMPONENT_FLOWER,
  ConstraintAirflow.COMPONENT_STATSD,
  ConstraintAirflow.COMPONENT_REDIS,
];

module.exports = ConstraintAirflow;