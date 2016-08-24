
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    fbid:      String,
    fname:     String,
    lname:     String,
    weight:    Number,
    gender:    String,
    chatids:   [String],
    contact:  {name: String, 
    	       phone: String}
});

module.exports = mongoose.model('User', UserSchema);