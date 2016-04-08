var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new mongoose.Schema({
	created_by: String,		//should be changed to ObjectId, ref "User" (Romain)
	created_at: {type: Date, default: Date.now},
	text: String
});

var userSchema = new mongoose.Schema({
	username: String,
	password: String, //hash created from password
	created_at: {type: Date, default: Date.now},
	stocks:{type: [Schema.Types.Mixed],default: []} //object for following
});


mongoose.model('Post', postSchema);
mongoose.model('User', userSchema);
