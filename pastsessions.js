
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PastSessionsSchema   = new Schema({
    fbid:      String,
    drinklogs: [
    			{log: [{drinktime: Number, 
    	           drinkamount: Number,
    	           currbac: Number
    	     	  }],
    	     	 starttime: Number}
    	       ]   
});

module.exports = mongoose.model('PastSessions', PastSessionsSchema);