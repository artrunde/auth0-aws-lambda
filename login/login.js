angular.module( 'sample.login', [
  'auth0'
])
.controller( 'LoginCtrl', function HomeController( $scope, auth, $location, store ) {

  function getOptionsForRole(isAdmin, token) {

    if(isAdmin) {

      return {
          "id_token": token,
          "role":"arn:aws:iam::401237329133:role/auth0-api-role",
          "principal": "arn:aws:iam::401237329133:saml-provider/auth0"

        };
      }

    else {

      return {
          "id_token": token,
          "role":"arn:aws:iam::401237329133:role/auth0-api-social-role",
          "principal": "arn:aws:iam::401237329133:saml-provider/auth0"
        };
    }

  }

  $scope.login = function() {

     var params = {
        authParams: {
          scope: 'openid email' 
        }
      };

    auth.signin(params, function(profile, token) {
      store.set('profile', profile);
      store.set('token', token);

      // set admin and get delegation token from identity token.
      profile.isAdmin = !profile.identities[0].isSocial;
      var options = getOptionsForRole(profile.isAdmin, token);

      auth.getToken(options)
       .then(
       function(delegation)  {
         store.set('awstoken', delegation.Credentials);
         $location.path("/");
       },
       function(err) {
        console.log('failed to acquire delegation token', err);
       });


    }, function(error) {
      console.log("There was an error logging in", error);
    });

  }

});
