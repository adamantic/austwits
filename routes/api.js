var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var Post = mongoose.model('Post'),
	User = mongoose.model('User');
//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects

	//allow all get request methods
	if(req.method === "GET"){
		return next();
	}
	if (req.isAuthenticated()){
		return next();
	}

	// if the user is not authenticated then redirect him to the login page
	return res.redirect('/#login');
};

router.route('/posts/tag')
	.post(function(req,res){

		var tagId = req.body.tag;
		Post.find({tags: tagId}, function(err, posts){
			if(err){
				res.send(err);
				return
			}
			res.json(posts);
		});
	})
	
//Register the authentication middleware
router.use('/posts', isAuthenticated);


router.route('/posts')
	//creates a new post
	.post(function(req, res){

		var post = new Post();
		post.text = req.body.text;
		post.created_by = req.body.created_by;
		post.tags = req.body.tags;
		post.save(function(err, post) {
			if (err){
				return res.send(500, err);
			}
			return res.json(post);
		});
	})
	//gets all posts
	.get(function(req, res){
		console.log('debug1');
		Post.find(function(err, posts){
			console.log('debug2');
			if(err){
				return res.send(500, err);
			}
			return res.send(200,posts);
		});
	});

//post-specific commands. likely won't be used
router.route('/posts/:id')
	//gets specified post
	.get(function(req, res){
		Post.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);
			res.json(post);
		});
	}) 
	//updates specified post
	.put(function(req, res){
		Post.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);

			post.created_by = req.body.created_by;
			post.text = req.body.text;

			post.save(function(err, post){
				if(err)
					res.send(err);

				res.json(post);
			});
		});
	})
	//deletes the post
	.delete(function(req, res) {
		Post.remove({
			_id: req.params.id
		}, function(err) {
			if (err)
				res.send(err);
			res.json("deleted :(");
		});
	});

router.route('/stock/follow')
	.post(function(req,res){

		if(!req.user){
			res.send({error:true, message:"Please sign in"});
			return
		}

		var userId = req.user._id;
		var stock = req.body;
		var update = {$push:{stocks:stock}}
		var options = {new:true};
		User.findByIdAndUpdate(userId,update,options,function(err,user){
			if(err){
				res.send({error:true,message:"Error following"})
				return
			}
			res.send(user);
		})
	});

//added by Michael
router.route('/stock/unfollow')
	.post(function(req,res){

		if(!req.user){
			res.send({error:true, message:"Please sign in"});
			return
		}
		var userId = req.user._id;
		var stock = req.body;
		var update = {$pull:{stocks:{ticker:stock.ticker}}};
		var options = {new:true};
		User.findByIdAndUpdate(userId,update,options,function(err,user){
			if(err){
				res.send({error:true,message:"Error unfollowing"})
				return
			}
			res.send(user);
		})
	});

module.exports = router;
