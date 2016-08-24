// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var request = require('request');

// Schemas
var User = require('./user.js');
var CurrSession = require('./currsession.js');
var PastSessions = require('./pastsessions.js');
var Chats = require('./chats.js');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// Connect db
mongoose.connect(process.env.MONGOLAB_URI);

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// // middleware to use for all requests
// router.use(function(req, res, next) {
//     // do logging
//     console.log('Something is happening.');
//     next(); // make sure we go to the next routes and don't stop here
// });

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'live' });   
});

// more routes for our API will happen here


//===========================================================================
// Users table and operations
//===========================================================================

// on routes that end in /users
// ----------------------------------------------------
router.route('/users')

    // create a user (accessed at POST /api/users)
    .post(function(req, res) {
        var user = new User();      // create a new instance of the User model

        // form checking
        if (!(req.body.fbid && req.body.fname && req.body.lname)) {
            res.json({message: 'Empty params!'});
            return;
        }

        user.fbid  = req.body.fbid;
        user.fname = req.body.fname;
        user.lname = req.body.lname;
        user.weight = req.body.weight;
        user.gender = req.body.gender;
        if (req.body.contactname && req.body.contactnumber) {
        	user.contact = {name: req.body.contactname, 
							phone: req.body.contactnumber};	
        }
        user.chatids = [];

        // check if the fbid already exists
        User.find({fbid: req.body.fbid}, function(err, userRes) {
            if (err)
                res.send(err);

            if (userRes.length > 0) {
                res.json({message: 'User already exists!'});
            } else {
                // save the user and check for errors
                user.save(function(err) {
                    if (err)
                        res.send(err);
                    res.json({ message: 'User created!' });
                });
            }
        });
        
    })

    // testing purposes
    // get all the users (accessed at GET /api/users)
    .get(function(req, res) {
        User.find(function(err, users) {
            if (err)
                res.send(err);

            res.json(users);
        });
    });

// on routes that end in /users/:fbid
// ----------------------------------------------------
router.route('/users/:fbid')

    // get the user with that id (accessed at GET /api/users/:fbid)
    .get(function(req, res) {
        User.find({fbid: req.params.fbid}, function(err, userRes) {
            if (err)
                res.send(err);
            res.json(userRes);
        });
    })

    // update the user with this id (accessed at PUT /api/users/:fbid)
    .put(function(req, res) {
        User.find({fbid: req.params.fbid}, function(err, userRes) {
            if (err)
                res.send(err);

            if (typeof userRes[0] === 'undefined' || userRes[0] === null) {
            	res.json({ message: 'No such user' });
            	return;
            }

            if (req.body.type === 'add') {
				userRes[0].fname = req.body.fname;
	        	userRes[0].lname = req.body.lname;
	        	userRes[0].weight = req.body.weight;
	        	userRes[0].gender = req.body.gender;
        		if (req.body.contactname && req.body.contactnumber)
    				userRes[0].contact = {name: req.body.contactname, 
									phone: req.body.contactnumber};

	            if (req.body.chatid)
	            	userRes[0].chatids.push(req.body.chatid);
            }
            else if (req.body.type === 'remove') {
	            if (req.body.chatid) {
	            	var index = userRes[0].chatids.indexOf(req.body.chatid);
	            	if (index > -1) {
					    userRes[0].chatids.splice(index, 1);
					}
	            }
            }       	

            User.update({fbid: req.params.fbid}, userRes[0], function(err, userRes2) {
            	if (err)
            		res.send(err);   
        		res.json({ message: 'User updated!' });         	
            });

        });
    })

     // delete the user with this id (accessed at DELETE /api/users/:fbid)
    .delete(function(req, res) {
        User.remove({fbid: req.params.fbid}, function(err, userRes) {
            if (err)
                res.send(err);
            res.json(userRes);
        });
    });

//===========================================================================
//===========================================================================
// CurrSession table and operations
//===========================================================================
//===========================================================================
// on routes that end in /currsession
// ----------------------------------------------------
router.route('/currsession')

    // create a user (accessed at POST /api/currsession)
    .post(function(req, res) {
        var currSession = new CurrSession();      // create a new instance of the User model
        currSession.fbid  = req.body.fbid;
        currSession.drinklogs = [];

        // form checking
        if (!req.body.fbid) {
            res.json({message: 'Empty params!'});
            return;
        }

        // check if the fbid already exists
        CurrSession.find({fbid: req.body.fbid}, function(err, currSessionRes) {
            if (err)
                res.send(err);

            if (currSessionRes.length > 0) {
                res.json({message: 'Session already exists!'});
            } else {
                // save the user and check for errors
                currSession.save(function(err) {
                    if (err)
                        res.send(err);
                    res.json({ message: 'Session created!' });
                });
            }
        });
        
    })

    // testing purposes
    // get all the users (accessed at GET /api/users)
    .get(function(req, res) {
        CurrSession.find(function(err, currSessionRes) {
            if (err)
                res.send(err);
            res.json(currSessionRes);
        });
    });

// on routes that end in /users/:fbid
// ----------------------------------------------------
router.route('/currsession/:fbid')

    // get the user with that id (accessed at GET /api/currsession/:fbid)
    .get(function(req, res) {
        CurrSession.find({fbid: req.params.fbid}, function(err, currSessionRes) {
            if (err)
                res.send(err);
            res.json(currSessionRes);
        });
    })

    // update the user with this id (accessed at PUT /api/users/:fbid)
    .put(function(req, res) {
        CurrSession.find({fbid: req.params.fbid}, function(err, currSessionRes) {
            if (err) { res.send(err); return; }
            if (typeof currSessionRes[0] === 'undefined') {
            	res.send({ message: 'No such session' });
            	return;
            }

            if (req.body.type === 'add') {
	            if (req.body.drinktime && req.body.drinkamount && req.body.currbac) {
	            	currSessionRes[0].drinklogs.push({drinktime: parseInt(req.body.drinktime), 
	            									  drinkamount: parseFloat(req.body.drinkamount),
	            									  currbac: parseFloat(req.body.currbac)});	
	            }
            }
            else if (req.body.type === 'remove') {
            	//REMOVE TWICE BECAUSE EMILY IS POOP
            	if (currSessionRes[0].drinklogs.length > 0)
            		currSessionRes[0].drinklogs.pop();
            	if (currSessionRes[0].drinklogs.length > 0)
            		currSessionRes[0].drinklogs.pop();
            }
            //ends currsession and adds to pastsessions.
            else if (req.body.type === 'end') {
            	PastSessions.find({fbid: req.params.fbid}, function(err, pastSessionsRes) {
		            if (err) { res.send(err); return; }
		            if (typeof pastSessionsRes[0] === 'undefined') {
		            	res.send({ message: 'No such session' });
		            	return;
		            }

    	            if (req.body.drinktime && req.body.drinkamount && req.body.currbac) {
		            	currSessionRes[0].drinklogs.push({drinktime: parseInt(req.body.drinktime), 
		            									  drinkamount: parseFloat(req.body.drinkamount),
		            									  currbac: parseFloat(req.body.currbac)});	
		            }

		            pastSessionsRes[0].drinklogs.push({log: currSessionRes[0].drinklogs, starttime: currSessionRes[0].drinklogs[0].drinktime});
                    PastSessions.update({fbid: req.params.fbid}, pastSessionsRes[0], function(err, pastSessionsRes2) {
		            	if (err) { res.send(err); return; }        	
		            });	
		        });

				CurrSession.remove({fbid: req.params.fbid}, function(err, currSessionRes2) {
		            if (err) { res.send(err); return; }
		        });
		        res.json({ message: 'Done!' });
		        return;
            }
            

            CurrSession.update({fbid: req.params.fbid}, currSessionRes[0], function(err, currSessionRes2) {
            	if (err)
            		res.send(err);   
        		res.json(currSessionRes2);         	
            });

        });
    })

     // delete the currsession with this id (accessed at DELETE /api/currsession/:fbid)
    .delete(function(req, res) {
        CurrSession.remove({fbid: req.params.fbid}, function(err, currSessionRes) {
            if (err) { res.send(err); return; }   
            res.json(currSessionRes);
        });
    });

//===========================================================================
//===========================================================================
// CurrSession table and operations
//===========================================================================
//===========================================================================
// on routes that end in /pastsessions
// ----------------------------------------------------
router.route('/pastsessions')

    // create a user (accessed at POST /api/pastsessions)
    .post(function(req, res) {
        var pastSessions = new PastSessions();      // create a new instance of the User model
        pastSessions.fbid  = req.body.fbid;
        pastSessions.drinklogs = [];

        // form checking
        if (!req.body.fbid) {
            res.json({message: 'Empty params!'});
            return;
        }

        // check if the fbid already exists
        PastSessions.find({fbid: req.body.fbid}, function(err, pastSessionsRes) {
            if (err) {
                res.send(err);
                return;
            }

            if (pastSessionsRes.length > 0) {
                res.json({message: 'Session already exists!'});
            } else {
                // save the user and check for errors
                pastSessions.save(function(err) {
                    if (err) {
                        res.send(err);
                        return;
                    }
                    res.json({ message: 'Session created!' });
                });
            }
        });
        
    })

    // testing purposes
    // get all the users (accessed at GET /api/users)
    .get(function(req, res) {
        PastSessions.find(function(err, pastSessionsRes) {
            if (err) {res.send(err); return;}
            res.json(pastSessionsRes);
        });
    });

// on routes that end in /users/:fbid
// ----------------------------------------------------
router.route('/pastsessions/:fbid')

    // get the user with that id (accessed at GET /api/pastsessions/:fbid)
    .get(function(req, res) {
        PastSessions.find({fbid: req.params.fbid}, function(err, pastSessionsRes) {
            if (err) {res.send(err); return;}
            res.json(pastSessionsRes);
        });
    })

     // delete the user with this id (accessed at DELETE /api/pastsessions/:fbid)
    .delete(function(req, res) {
        PastSessions.remove({fbid: req.params.fbid}, function(err, pastSessionsRes) {
            if (err) {res.send(err); return;}
            res.json(pastSessionsRes);
        });
    });

//===========================================================================
//===========================================================================
// Chats table and operations
//===========================================================================
//===========================================================================
// on routes that end in /chats
// ----------------------------------------------------
router.route('/chats')

    // create a chat given fbids (accessed at POST /api/chats)
    .post(function(req, res) {
        var chats = new Chats();      // create a new instance of the Chat model

        // check fbids is not empty
        if (!(req.body.fbids && req.body.chat_name)) {
            res.json({message: 'Empty params!'}); 
            return;            
        }
        //set chat fbids and check each fbid is in database.
        chats.fbids = req.body.fbids.split(',');
        chats.chat_name = req.body.chat_name;
		var fbidLength = chats.fbids.length;
		var d = new Date();
        var time = d.getTime();
		chats.created_at = time;
		chats.recent_time = time;
        chats.chat_room_id = chats.fbids[0] + d.getTime().toString();

        //check users exists and update.
        function recupdate(i) {
        	if (i < fbidLength) {
    			User.find({fbid: chats.fbids[i]}, function(err, userRes) {
		            if (err) {res.send(err); return;}
	            	userRes[0].chatids.push(chats.chat_room_id);
	            	User.update({fbid: userRes[0].fbid}, userRes[0], function(err, userRes2) {
		            	if (err) {res.send(err); return;}	

		            	if (i === fbidLength-1) {
					        chats.save(function(err) {
					            if (err) {res.send(err); return;}
					            res.json({ message: 'Chat created!', chat_room_id: chats.chat_room_id });
					        });   
				        }  
				        recupdate(i+1);
	       			}); 

	        	});
        	}
        }
        function reccheck(i) {
        	if (i < fbidLength) {
    			User.find({fbid: chats.fbids[i]}, function(err, userRes) {
		            if (err) {res.send(err); return;}
		            if (typeof userRes[0] === 'undefined' || userRes[0] === null) {
		            	res.json({ message: 'No such user, chat not created' });
		            	return;
		            }
	            	
	            	if (i === fbidLength-1) {
	            		recupdate(0);
			        }  
			        reccheck(i+1);
	        	});
        	}
        }
        reccheck(0);
        
    })

    // testing purposes
    // get all the users (accessed at GET /api/users)
    .get(function(req, res) {
        Chats.find(function(err, chatsRes) {
            if (err) {console.log(err); return;}
            res.json(chatsRes);
        });
    })

    //testing
    .delete(function(req, res) {
        Chats.remove(function(err, chatsRes) {
            if (err) {console.log(err); return;}
            res.json({ message: 'All Chats successfully deleted'});
        });
    });

// on routes that end in /users/:fbid
// ----------------------------------------------------
router.route('/chats/:chat_room_id')

    // get the chats with that id (accessed at GET /api/chats/:chat_room_id)
    .get(function(req, res) {
        Chats.find({chat_room_id: req.params.chat_room_id}, function(err, chatsRes) {
			if (err) {console.log(err); return;}
            res.json(chatsRes);
        });
    })

    // update the chat with this id (accessed at PUT /api/chats/:chatid)
    .put(function(req, res) {
        Chats.find({chat_room_id: req.params.chat_room_id}, function(err, chatsRes) {
            if (err) {console.log(err); return;}
            if (typeof chatsRes[0] === 'undefined' || chatsRes[0] === null) {
            	res.send({ message: 'No such chat' });
            	return;
            }
        	

        	if (req.body.type === 'changename') {
        		if (req.body.chat_name) {
        			chatsRes[0].chat_name = req.body.chat_name;
        			Chats.update({chat_room_id: req.params.chat_room_id}, chatsRes[0], function(err, chatsRes2) {
		            	if (err) {res.json(err); return;}
						res.json({ message: 'Chat name changed!'}); 
		            });
      			}
      			else {
      				res.json({ message: 'chat_name empty'}); 
      			}
      			return;
        	}
            //Two cases, remove fbid or add fbid
            else if (req.body.type === 'adduser') {
	            if (req.body.fbid) {
	            	chatsRes[0].fbids.push(req.body.fbid);
	            	//add chat_room_id to user with fbid in user table
	            	User.find({fbid: req.body.fbid}, function(err, userRes) {
			            if (err) {res.json(err); return;}
		            	userRes[0].chatids.push(chatsRes[0].chat_room_id);
		            	User.update({fbid: userRes[0].fbid}, userRes[0], function(err, userRes2) {
			            	if (err) {res.json(err); return;}
			            	Chats.update({chat_room_id: req.params.chat_room_id}, chatsRes[0], function(err, chatsRes2) {
				            	if (err) {res.json(err); return;}
				        		res.json({ message: 'user added!'});         	
				            });
		       			});            	
		        	});
	            }
	            else {
	            	res.json({ message: 'fbid empty'}); 
	            }
	            return;
            }
            else if (req.body.type === 'removeuser') {
	            if (req.body.fbid) {
	            	var index = chatsRes[0].fbids.indexOf(req.body.fbid);
	            	if (index > -1) {
					    chatsRes[0].fbids.splice(index, 1);
					}
					//remove chat_room_id to user with fbid in user table
					User.find({fbid: req.body.fbid}, function(err, userRes) {
			            if (err) {res.json(err); return;}
						var chatindex = userRes[0].chatids.indexOf(chatsRes[0].chat_room_id);
		            	if (chatindex > -1) {
						    userRes[0].chatids.splice(chatindex, 1);
						}

		            	User.update({fbid: userRes[0].fbid}, userRes[0], function(err, userRes2) {
			            	if (err) {res.json(err); return;}
			            	Chats.update({chat_room_id: req.params.chat_room_id}, chatsRes[0], function(err, chatsRes2) {
				            	if (err) {res.json(err); return;}
				        		res.json({ message: 'user deleted!'});         	
				            });	
		       			});            	
		        	});
	            }         
	            return;	
            }

            // add a message. Body requires type='addmessage', fbid, and message.
            else if (req.body.type === 'addmessage') {
            	if (req.body.fbid && req.body.message) {
            		User.find({fbid: req.body.fbid}, function(err, userRes) {
			            if (err) {res.json(err); return;}
			            if (typeof userRes[0] === 'undefined' || userRes[0] === null) {
			            	res.json({ message: 'No such user' });
			            	return;
			            }
			            var fbname = userRes[0].fname + ' ' + userRes[0].lname;
            			var d = new Date();
            			var time = d.getTime();
        				chatsRes[0].messages.push({message: req.body.message,
								    		   created_at: time,
											user: {fbid: req.body.fbid, 
								           username: fbname}});
        				chatsRes[0].recent_time = time;
			            Chats.update({chat_room_id: req.params.chat_room_id}, chatsRes[0], function(err, chatsRes2) {
			            	if (err) {res.json(err); return;}
			            	console.log(chatsRes[0].chat_name);
			        		//GCM send to google server for push notifications
			        		request(
							    { method: 'POST',
							      url: 'https://android.googleapis.com/gcm/send',
							    headers: {
							        'Content-Type': 'application/json',
							        'Authorization':'key=AIzaSyDsxIb-IXiSkCBLpQAHFf-I44knFwfJaEI'
							    },
							    body: JSON.stringify({
							  "to" :  '/topics/topic_' + req.params.chat_room_id,
							  "data" : {
								"data" : {
								"chat_room_id": req.params.chat_room_id,
								"message": req.body.message,
								"message_id": "",
								"created_at": time,
								"fbid": req.body.fbid,
								"username": fbname,
								"chat_name": chatsRes[0].chat_name
								}}
							})
							    }
							  , function (err, response, body) {
									if (err) {res.json(err); return;}
							        res.json({ message: 'Chat updated!'}); 
							    }
							  )
						});

		        	});
            	}
            	return;
            }
            else {
            	res.json({ message: 'Enter type!'});
            }
        });
    })

     // delete the chat with this id (accessed at DELETE /api/chats/:chatid)
    .delete(function(req, res) {
        Chats.remove({chat_room_id: req.params.chat_room_id}, function(err, chatsRes) {
            if (err) {res.send(err); return;}
            res.json({ message: 'Chat successfully deleted'});
        });
    });

router.route('/chats/user/:fbid')

    // get all chat information for user with [fbid] (accessed at GET /api/chats/user/:fbid)
    .get(function(req, res) {
        User.find({fbid: req.params.fbid}, function(err, userRes) {
			if (err) {console.log(err); return;}
			if (typeof userRes[0] === 'undefined' || userRes[0] === null) {
            	res.json({ message: 'No such user' });
            	return;
            }
            var userchats = [];
            if (!userRes[0].chatids || userRes[0].chatids.length === 0) {
            	res.json({userchats});	
            	return;
            }

            var length = userRes[0].chatids.length;
            
            //recursive functions to loop through chatids and get the chat informations
            function rec(i) {
            	if (i < length) {
            		Chats.find({chat_room_id: userRes[0].chatids[i]}, function(err, chatsRes) {
			            if (err) {res.send(err); return;}
			            if (typeof chatsRes[0] === 'undefined' || chatsRes[0] === null) {
			            	res.send({ message: 'No such chat' });
			            	return;
			            }
			            userchats.push({chat_room_id: chatsRes[0].chat_room_id,
			                       chat_name: chatsRes[0].chat_name,
			                       recent_time: chatsRes[0].recent_time});
		            	//sort userchats
			        	if (i === length-1) {
			        		userchats.sort(function(a, b) {
							    return (b.recent_time) - (a.recent_time);
							});
		        			res.json({userchats});
			        	}
			        	rec(i+1);
			        })			        
            	}
            }
            rec(0);

        });
    });

router.route('/chats/bac/:chat_room_id')
    // get all bac
    .get(function(req, res) {
        Chats.find({chat_room_id: req.params.chat_room_id}, function(err, chatsRes) {
			if (err) {res.send(err); return;}
			if (typeof chatsRes[0] === 'undefined' || chatsRes[0] === null) {
            	res.send({ message: 'No such chat' });
            	return;
            }
			var length = chatsRes[0].fbids.length;
			var bacs = [];
            function rec(i) {
            	if (i < length) {
            		User.find({fbid: chatsRes[0].fbids[i]}, function(err, userRes) {
            			if (err) {res.send(err); return;}
			            if (typeof userRes[0] === 'undefined' || userRes[0] === null) {
			            	res.send({message: 'No such user'});
			            }
			            CurrSession.find({fbid: chatsRes[0].fbids[i]}, function(err, currsessionRes) {
				            if (err) {res.send(err); return;}
				            var name = userRes[0].fname + ' ' + userRes[0].lname;
				            if (typeof currsessionRes[0] === 'undefined' || currsessionRes[0] === null) {
				            	bacs.push({name: name, bac: {drinktime: 0, drinkamount: 0,currbac: 0}});
				            }
				            else {
				            	if (currsessionRes[0].drinklogs && currsessionRes[0].drinklogs.length > 0) {
					            	var lastindex = currsessionRes[0].drinklogs.length - 1;
					            	bacs.push({name: name, bac: currsessionRes[0].drinklogs[lastindex]});			            		
				            	}
				            	else {
				            		bacs.push({name: name, bac: {drinktime: 0, drinkamount: 0,currbac: 0}});
				            	}
				            }
				            if (i === length-1) {
				            	res.send(bacs);
				            }
				            rec(i+1);
	            		})
            		})
            		
            	}
            }
            rec(0);
        });
    });



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);