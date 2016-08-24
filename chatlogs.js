
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ChatLogsSchema   = new Schema({
    chatid:      String,
    messages: [{fbid:       String,
    			message:     String,
    			timestamp:   Number}]
});

module.exports = mongoose.model('ChatLogs', ChatLogsSchema);