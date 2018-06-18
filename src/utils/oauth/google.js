/*

Process:

User navigates (or is navigated) to login page:

This should make a request to Houston for settings, which should include a list of enabled OAuth providers.
For each provider it should include the client_id, and  redirect_url.

They click the google login button, which POST's to:

  https://accounts.google.com/o/oauth2/v2/auth?
   scope=https://www.googleapis.com/oauth2/v1/userinfo&
   access_type=offline&
   include_granted_scopes=true&
   state=state_parameter_passthrough_value&
   redirect_uri=http%3A%2F%2Foauth2.example.com%2Fcallback&
   response_type=code&
   client_id=client_id

Once they authorize the request, they should be redirected back to some page on the website

This page will check for:

?error=[reason] in the url args, in which case it should show an error and maybe redirect back to the login for (or redirect and show error on login)

or

?code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7

The web page should then make a GQL mutation of createOAuthUser, passing the code.

This operation should:

Take the code and make a POST request to `https://www.googleapis.com/oauth2/v4/token`

with fields: (Step 5 of https://developers.google.com/identity/protocols/OAuth2WebServer)

code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7&
client_id=your_client_id&
client_secret=your_client_secret&
redirect_uri=https://oauth2.example.com/code&
grant_type=authorization_code

The redirect_url should match the redirect_url in the request above

This will return a payload similar to

{
  "access_token":"1/fFAGRNJru1FTz70BzhT3Zg",
  "expires_in":3920,
  "token_type":"Bearer",
  "refresh_token":"1/xEoDL4iW3cxlI7yDbSRFYNG01kVKM2C-259HOF2aQbI"
}

!!!! THINK ABOUT THIS MORE !!!!
The API should then check settings if long term auth is enabled or not.


!!!! DONE THINKING !!!!


Use the access_token returned to make a request to get the email address of the user.  With the email address a record should be created
in the db for the user, and oauth_credentials created with the access_token, expires_in, token_type, and refresh_token.

Any createToken request should check if this refresh_token is still valid, and if not.
 */

/* params needed for request:
access_type=offline
scope: ["email"],  // maybe not needed, check what gets returned in response ???
  prompt: 'consent'



https://accounts.google.com/o/oauth2/v2/auth?scope=email&include_granted_scopes=true&access_type=offline&state=state_parameter_passthrough_value&redirect_uri=https%3A%2F%2Fhouston.astronomer.win%2Fv1%2Fwebhooks%2Ftest&response_type=token&client_id=405410476024-5ij9hem7854f07lo1pvubjuh8ephp5vq.apps.googleusercontent.com



state: state_parameter_passthrough_value
code: 4/AAC-fMhHURMa8rZ2j5zyjJyLsxm3AxT6wBhE5L8L78Z584r3yW7xxsRVx3tiWZEpyuc8AmNNF4jB0ZEs2BSSTxg
scope: https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.profile

 */

/* response:
{
"access_token" : "ya29.AHES6ZTtm7SuokEB-RGtbBty9IIlNiP9-eNMMQKtXdMP3sfjL1Fc",
"token_type" : "Bearer",
"expires_in" : 3600,
"refresh_token" : "1/HKSmLFXzqP0leUihZp2xUt3-5wkU7Gmu2Os_eBnzw74"
}
 */


/*
state=state_parameter_passthrough_value
access_token=ya29.GlvaBdLE2hEpUuDnntYD8jgTYHqTnDu5CeMQvwOKwL38R8sQ2ALZ2cF_t0f2ecObdjYkNzK4uv5Jm_6DZNIUgm2l9qWAz6EdcKbEftKWAWv0NVyHKJfcjeHaRbwD
token_type=Bearer
expires_in=3600
scope=https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/plus.me
 */