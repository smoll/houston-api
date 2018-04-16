const Config = require("../utils/config.js");
// const GRPC = require("grpc-caller");
// const PROTO_PATH = require("commander");
// class CommanderClient {
//   constructor(hostname, port) {
//     // const commanderProto = GRPC.load(PROTO_PATH + "-proto/commander.proto", "proto").commander;
//     // const commanderProto = GRPC.load({
//     //   root: PROTO_PATH + "-proto",
//     //   file: "commander.proto"
//     // }, "proto");
//     //
//     const host = `${hostname}:${port}`;
//     console.log(host);
//     // this.client = new commanderProto.commander.Commander(`${hostname}:${port}`, GRPC.credentials.createInsecure());
//     var server = new grpc.Server();
//     server.addService(hello_proto.Greeter.service, {sayHello: sayHello});
//     server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
//     server.start();
//
//
//     this.client = GRPC(`${hostname}:${port}`, {
//       root: PROTO_PATH,
//       file: "commander.proto"
//     }, "Commander");
//   }

const GRPC = require("grpc");
const PROTO_PATH = require("commander");
class CommanderClient {
  constructor(hostname, port) {
    // const commanderProto = GRPC.load(PROTO_PATH + "-proto/commander.proto", "proto").commander;
    // const commanderProto = GRPC.load({
    //   root: PROTO_PATH + "-proto",
    //   file: "commander.proto"
    // }, "proto");
    //
    const host = `${hostname}:${port}`;
    console.log(`Connecting to host ${host}`);
    // this.client = new commanderProto.commander.Commander(`${hostname}:${port}`, GRPC.credentials.createInsecure());

    const proto = GRPC.load({
      root: PROTO_PATH,
      file: "commander.proto",
    });

    this.client = new proto.commander.Commander(host, GRPC.credentials.createInsecure());
  }

  status() {
    return this.client.getChannel();
  }

  fetchDeployment(options = {}) {
    this.client.fetchDeployment({}, function(err, response) {
      console.log(err);
      console.log(response);
    });
  }

  createDeployment(deployment, options = {}) {
    const payload = {
      release_name: deployment.releaseName,
      chart: {
        name: deployment.type,
        version: deployment.version,
      },
      organization_uuid: deployment.organizationUuid,
      raw_config: JSON.stringify(options.config),
      secrets: options.secrets
    };
    console.log(payload);

    return new Promise((resolve, reject) => {
      console.log("Actually executing now");
      this.client.createDeployment(payload, function (err, response) {
        console.log("Create deployment call completed");
        console.log(err);
        console.log(response);
        if (err) {
          return reject(err);
        }
        return resolve(response);
      });
    });
  }

  updateDeployment(deployment, payload) {

  }

  upgradeDeployment(deployment, version) {

  }

  deleteDeployment(deployment) {

  }
}

module.exports = CommanderClient;
