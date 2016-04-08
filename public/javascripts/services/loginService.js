angular.module('austwits').service('loginService',['$http',function($http){

	var user = {};


	 function login(loginInfo){
		 console.log(loginInfo)
		return $http.post('/auth/login', loginInfo)
	}

	function setUser(userToSet){
		angular.copy(userToSet,user);
	}
	 function signout(){
		//we return the result of $http that is a promise. 
		//we tcan so hook specific behaviour in each controller 
		//that uses that function call, and if we whant general behaviour, 
		//we just add it here in the service where we allso hook in the 
		//promises result.
		return	$http.get('auth/signout').then(function(){
				angular.copy({},user); //unsetting the user variable.
			},function(error){
				console.error('couldnt signout',error);
			});

	};

	function register(newUser){
		return $http.post('/auth/signup', newUser).then(function(res){
				 angular.copy(res.data.user,user);
		});
	};

	return {
		register : register,
		signout : signout,
		login: login,
		user : user,
		setUser : setUser
	};
}]);