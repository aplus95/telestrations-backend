
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CurrSessionSchema   = new Schema({
    fbid:      String,
    drinklogs: [{drinktime: Number, 
    	         drinkamount: Number,
    	         currbac: Number}]
});

module.exports = mongoose.model('CurrSession', CurrSessionSchema);