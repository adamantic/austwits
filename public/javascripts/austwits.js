var app = angular.module('austwits', ['ngRoute', 'ngResource']);//.run(function($rootScope) {
		//todo move this to the good controller/s, it is bad to have stuff on the rootscope!!!
		//$rootScope.user  = loginService.user;
		//$rootScope.signout = loginService.signout; //exposing the signout method from the loginService.
	//});

	app.config(function($routeProvider){
		$routeProvider
			//the timeline display
			.when('/', {
				templateUrl: 'main.html',
				controller: 'mainController'
			})
			//the login display
			.when('/login', { 
				templateUrl: 'login.html',
				controller: 'authController'
			})
			//the signup display 
			.when('/register', {
				templateUrl: 'register.html',
				controller: 'authController'
			})
			.when('/stream',{
				templateUrl:'/stream.html',
				controller: 'mainController'
			})
            .when('/myportfolio',{
                templateUrl:'/myportfolio.html',
                controller: 'mainController'
            })
            .when('/tags/:tagId',{
            	templateUrl: '/tag.html',
            	controller: 'tagController'
            })
	});
	app.controller('tagController',function($routeParams,$http,$log,$scope,$sce){
		$scope.tagName = $routeParams.tagId;


		$http
			.post('/api/posts/tag',{tag: $scope.tagName})
			.then(function(response){
				$scope.postsWithTag = response.data;
				$scope.postsWithTag.forEach(function(post){
					post.text = $sce.trustAsHtml(post.text);
				})
			},function(err){	
				$log.error("Error getting post with specified tag")
			})
	})
	app.factory('postService', function($resource){
		return $resource('/api/posts/:id');
	});

	app.controller('mainController', function($scope, $rootScope, postService, loginService,$sce,stockService,$filter){
		$scope.signout = loginService.signout;
		$scope.user = loginService.user;
		postService.query(function(response){
			$scope.posts = response;
			$scope.posts.forEach(function(post){
				post.text = $sce.trustAsHtml(post.text);
			})
		});
		$scope.newPost = {created_by: '', text: '', created_at: ''};
	
		$scope.post = function() {
		  $scope.newPost.created_by = $rootScope.current_user;
		  $scope.newPost.created_at = Date.now();

		  var a = $scope.newPost.text;
		  var final = a;
		  //check here for tags
		  var pattern = /\$[A-Z]*\b/gi;
		  var allTags =[];
		  var stocks = stockService.getStocks();
			while((match = pattern.exec(a))!== null){
				//check if it exists instock.json
				var isThere = false;
				var stock = $filter('filter')(stocks,{ticker: match[0].substring(1)},true);
					if(stock.length != 0){
				        var replacement = '<a href="#/tags/'+match[0].substring(1)+'">'+match[0]+'</a>';
				        var subparts = final.split(match[0]);
				        var final = subparts[0] + replacement + subparts[1];
				        allTags.push(match[0].substring(1));
				    }
			}

		$scope.newPost.text = final;
		$scope.newPost.tags = allTags;
		  postService.save($scope.newPost, function(){
		    $scope.posts = postService.query(function(response){
					$scope.posts = response;
					$scope.posts.forEach(function(post){
						post.text = $sce.trustAsHtml(post.text);
					})
				});
		    $scope.newPost = {created_by: '', text: '', created_at: ''};
		  });
		};
	});

	app.controller('authController', function($scope, $http, $rootScope, $location, loginService){
		$scope.loginInfo = {username: '', password: ''};
		$scope.error_message = '';
		$scope.user = loginService.user; //exposing the user data from the loginService

		$scope.login =  function(){
			loginService.login($scope.loginInfo).then(function(res){ 
				if(res.data.state =="failure"){
                    $scope.message = res.data.message;
                    return;
                }
                loginService.setUser(res.data.user)
                $location.path('/');
			},function(err){ //run if failure
			//	$location.path('/login');
                $scope.message = err.data.message;
			});
		};

		$scope.register = function(newUser){
			loginService.register(newUser).then(function(res){
				$location.path('/');
			},function(err){
				$scope.error_message = err.message;
			});
		};
	});
	//stock controller

	app.controller('stockController', ['$scope', '$http','stockService','loginService','$filter','stockApi', function ($scope, $http,stockService,loginService,$filter,stockApi) {
		var user = loginService.user;

    //isfollowing
        $scope.isFollowing = function(stock){
        	if(user && user.stocks){
            	var results =[];
            	user.stocks.forEach(function(userStock){
            		if(userStock.ticker == stock.ticker){
            			results.push(stock);
            		}
            	})
            	if(results && results.length > 0){
            		return true
            	}else{
            		return false
            	}
        	}else{
        		return false
        	}
        }

	    $http.get('/javascripts/stocks.json').success(function (data) {
	    	//if user not logged in do nothing
	    	if(!user){
	    		$scope.stocks = data;
	    	}else{
	    		//if user is logged in get value of stock from api
	    		$scope.stocks = data;
	    		$scope.stocks.forEach(function(stock){
	    			//check if yahoo attribute is present
	    			if(stock.yahoo && stock.yahoo!= ""){
	    				//check if user is following the stock
	    				if(stock.yahoo.split("/")[1] && $scope.isFollowing(stock)){
	    					//make the call to api using our service we defned
	    					stockApi.quandl(stock.yahoo.split("/")[1]).then(function(res){
	    						//store the required value in display
	    						stock.display = res.data.dataset.data[1][2];
	    						stock.following = true;
	    					},function(err){
	    						console.log("Error getting"+stock.yahoo);
	    					})
	    				}
	    			}
	    		})
	    	}
	    });


	                $scope.follow = function(stock){	
	                	stockService.followStock(stock)
	                		.then(function(res){
	                			if(res.data.error){
	                				alert(res.data.message);
	                				return;
	                			}
			    			if(stock.yahoo && stock.yahoo!= ""){
			    				//check if user is following the stock
			    				if(stock.yahoo.split("/")[1]){
			    					//make the call to api using our service we defned
			    					stockApi.quandl(stock.yahoo.split("/")[1]).then(function(res){
			    						//store the required value in display
			    						stock.display = res.data.dataset.data[1][2];
			    						stock.following = true;
			    					},function(err){
			    						console.log("Error getting"+stock.yahoo);
			    					})
			    				}
			    			}
	                			loginService.setUser(res.data);
	                		},function(err){

	                		})
	                }
        //added by Michael
                $scope.unfollow = function(stock){
                    stockService.unfollowStock(stock)
                        .then(function(res){
                            if(res.data.error){
                                alert(res.data.message);
                                return;
                            }
                            loginService.setUser(res.data);
                        },function(err){
        
                        })
                }
	}]);
// added by sparsh
//created a service that fetches data from the remote api
//good to share data between controllers
	app.service('stockApi',function($http){
		//this function returns a promise which we will use in our controller
		this.quandl = function(value){
			return $http.get('https://www.quandl.com/api/v3/datasets/YAHOO/'+value+'.json?api_key=1C5SvTESp7rUGJMsW1iV')
		}
	})
    //follow controller
    app.controller('followController', ['$scope', '$http', function ($scope, $http) {
        $http.get('/javascripts/stocks.json').success(function (data) {
            $scope.stocks = data;
        });
    }]);

	app.controller('spyController', ['$scope', '$http', function ($scope, $http) {
		$http.get('https://www.quandl.com/api/v3/datasets/YAHOO/INDEX_SPY.json?api_key=1C5SvTESp7rUGJMsW1iV').success(function (data) {
			$scope.spy = data;
		});
	}]);

function headerController($scope, $location)
	{
		$scope.isActive = function (viewLocation) {
			return viewLocation === $location.path();
		};
	}

