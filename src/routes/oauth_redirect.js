const BaseRoute = require("./base.js");

class OAuthRedirectRoute extends BaseRoute {
  route() {
    return "oauth_redirect";
  }

  method() {
    return ["get"];
  }

  async action(req, res) {
    let location = "`\$\{location.protocol\}//\$\{location.host\}/oauth`;";

    const template = `
<!doctype html>
  <head>
    <meta charset=utf-8>
    <title>OAuth Redirect</title>
  </head>
  <body>
    <noscript>JavaScript must be enabled to authenticate with the system!</noscript>
    <script type="text/javascript">
      (function() {
        var base = ${location};
        
        function addHiddenField(form, key, value) {
          var hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", value);
          form.appendChild(hiddenField);
        }
  
        var form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", base);
        form.setAttribute("enctype", "form-data");
  
        var params = location.hash.replace('#', '').split("&");
        for(var i = 0; i < params.length; i++) {
          var parts = params[i].split("=");
          addHiddenField(form, parts[0], parts[1]);
        }
  
        document.body.appendChild(form);
        form.submit();
      })();
    </script>
  </body>
</html>`;
    return res.end(template);
  }
}

module.exports = OAuthRedirectRoute;