
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ChatsSchema   = new Schema({
    chat_room_id:   String,
    fbids:          [String],
    created_at:     Number,
    chat_name: 	    String,
    recent_time:     Number,
    messages:       [{message:     String,
    			      created_at:   Number,
					  user: {fbid: String, 
           					 username: String}}]
});

module.exports = mongoose.model('Chats', ChatsSchema);