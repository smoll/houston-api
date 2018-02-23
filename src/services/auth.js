const { BaseService } = require("@moilandtoil/sealab-application");
const JWT = require("jsonwebtoken");

const Config = require("../utils/config.js");
const Context = require("../context.js");

const MAX_DURATION = 7;
const MIN_DURATION = 1;

class AuthService extends BaseService {

  async authenticateUser(emailOrUsername, password) {
    // currently just supporting local user auth, but we can expand later to be other sources

    return this.service("local_user").authenticateUser(emailOrUsername, password);
  }

  async generateTokenPayload(user, context = {}) {
    const tokenPayload = {
      id: user.uuid,
      sU: user.superAdmin || false
    };

    return tokenPayload;
  }

  createJWT(payload, expiration_days) {
    expiration_days = Math.max(Math.min(expiration_days, MAX_DURATION), MIN_DURATION);

    let passphrase = Config.get(Config.JWT_PASSPHRASE);
    let expiration = {
      expiresIn: `${expiration_days} day`
    };

    return JWT.sign(payload, passphrase, expiration);
  }

// GenerateTokenByUID: (user_id, duration = 1) => {
//   let TokenPayload = {
//     success: false,
//     message: "Token Cannot Be Created",
//     token: null,
//     decoded: null,
//     duration
//   };
//
//   if (duration < 1) duration = 1;
//   if (duration > 7) duration = 7;
//
//   const CreateTokenPromise = new Promise(
//       (resolve, reject) => {
//         User.findById({_id: user_id})
//             .then((data) => {
//               //console.log("GenerateToken", data);
//               const UserObj = {
//                 id: user_id,
//                 sU: false //SuperUser: always returning false until user roles are defined
//               };
//               return resolve({
//                 ...TokenPayload,
//                 success: true,
//                 message: "You shall pass",
//                 token: ForgeJWT(UserObj, duration),
//                 decoded: UserObj
//               });
//             })
//             .catch((err) => {
//               return reject(TokenPayload);
//             });
//       }
//   );
//   return CreateTokenPromise;
// },
//     VerifyToken: (token) => {
//   let TokenPayload = {
//     success: false,
//     message: "Token Cannot Be Validated",
//     token: token,
//     decoded: {},
//     service: null,
//     user: null
//   };
//   const VerifyTokenPromise = new Promise(
//       (resolve, reject) => {
//         if (token.startsWith("service:")) {
//           // If API KEY
//           const apiKey = token.substr(8);
//           ServiceHelper.fetchService(apiKey).then((service)=>{
//             if (!service) {
//               return resolve(TokenPayload);
//             }
//             TokenPayload.service = service.dataValues;
//             TokenPayload.success = true;
//             TokenPayload.message = "Valid Token";
//             return resolve(TokenPayload);
//           });
//         } else {
//           // If JWT
//           jwt.verify(token, process.env.TOKEN, (err, decoded) => {
//             if (err) {
//               TokenPayload.success = false;
//               TokenPayload.message = "Not A Valid Token";
//               return resolve(TokenPayload);
//             } else {
//               UserHelper.fetchUserById(decoded.id)
//                   .then((user)=>{
//                     TokenPayload.user = user;
//                     TokenPayload.success = true;
//                     TokenPayload.message = "Valid Token";
//                     TokenPayload.decoded = decoded;
//                     return resolve(TokenPayload);
//                   });
//             }
//           });
//         }
//       }
//   );
//   return VerifyTokenPromise;
// },
//     GenerateContext: function(accessToken, organizationId) {
//   let context = new Context();
//   context.addToken(accessToken);
//
//   return new Promise((resolve) => {
//     // Verify token
//     // // Detect if its a JWT or API Key
//     // Assign Service or User context & permissions
//
//     this.VerifyToken(accessToken).then((payload) => {
//       if (!payload.success) {
//         return Promise.reject(context.get());
//       }
//       if (payload.user) {
//         context.addUser(payload.user);
//       }
//       if (payload.service) {
//         context.addService(payload.service);
//       }
//       // if no organization, nothing left to check, resolve context in current state
//       if (!organizationId) {
//         return resolve(context.get());
//       }
//
//       // otherwise query for org
//       return OrganizationHelper.fetchOrganization(organizationId);
//     }).then((organization) => {
//       context.addOrg(organization);
//       return resolve(context.get());
//     }).catch((err) => {
//       return resolve(context.get());
//     });
//   });
// },

  // Incomplete functions for doing passport auth. These may need to exposed via express endpoints and just
  // use passport to manage the strategies since it uses a series of callbacks to work.  In addition
  // some strategies require multiple requests (ie OAuth will require the 3rd party to redirect back with a token,
  // and then we'll need to make a request back to the 3rd party with that token.  It is currently unclear whether
  // we can just rely on the client to handle the first part of the interaction.

  getAuthStrategy(providerType) {
    let strategies = {};
    let userModel = this.model("user");
    strategies[userModel.PROVIDER_LOCAL] = this.service("local_user").getAuthStrategy();

    return strategies[providerType];
  }
  //
  // authenticateUser(providerType, request) {
  //   let strategy = this.getAuthStrategy(providerType);
  //   return strategy(request);
  // }
}

module.exports = AuthService;