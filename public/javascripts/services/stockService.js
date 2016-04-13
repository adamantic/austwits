angular.module('austwits').service('stockService',['$http',function($http){

	var service = this;

	service.stocks = []; //we have no user in the begining.

	service.loadStocks = function(){
		$http.get('/javascripts/stocks.json').then(function (res) {
            service.stocks = res.data;
        });
	}

	service.followStock = function(stock){
		return $http.post('/api/stock/follow',stock);
	}

	//added by Michael
	service.unfollowStock = function(stock){
		return $http.post('/api/stock/unfollow',stock);
	}

	service.getStocks = function(stock){
		return service.stocks;
	}


	service.loadStocks(); //done only once when service is instantiated.

	return service;
}]);