_ = require("lodash");

class ConstraintBase {
  constructor(config = {}, cpuUnit = "m", memoryUnit = "Mi") {
    this.config = config;
    this.cpuUnit = cpuUnit;
    this.memoryUnit = memoryUnit;
  }

  initBlock(cpu, memory) {
    return {
      cpu: `${cpu}${this.cpuUnit}`,
      memory: `${memory}${this.memoryUnit}`,
    }
  }

  initResourceByRatio(cpu, memory, ratio = 1.5) {
    return {
      limits: this.initBlock(cpu * ratio, memory * ratio),
      requests: this.initBlock(cpu, memory),
    }
  }

  initResourceByValue(cpuLimit, memoryLimit, cpuRequest, memoryRequest) {
    return {
      limits: this.initBlock(cpuLimit, memoryLimit),
      requests: this.initBlock(cpuRequest, memoryRequest),
    }
  }

  merge() {
    this.config = _.merge(...arguments);
  }
}

module.exports = ConstraintBase;

