'use strict';

// Weather Example
// See https://wit.ai/sungkim/weather/stories and https://wit.ai/docs/quickstart
const Wit = require('node-wit').Wit;
const FB = require('./facebook.js');
const Config = require('./const.js');
const async = require('async');


// Helper function to get the first message
const firstEntityValue = (entity) => {
    const val = entity && Array.isArray(entity) &&
            entity.length > 0 &&
            entity[0].value
        ;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};






// Bot actions
const actions = {
  say(sessionId, context, message, cb) {
    console.log(message);

    // Bot testing mode, run cb() and return
    if (require.main === module) {
      cb();
      return;
    }

    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to from context
    // TODO: need to get Facebook user name
    const recipientId = context._fbid_;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      FB.fbMessage(recipientId, message, (err, data) => {
        if (err) {
          console.log(
            'Oops! An error occurred while forwarding the response to',
            recipientId,
            ':',
            err
          );
        }

        // Let's give the wheel back to our bot
        cb();
      });
    } else {
      console.log('Oops! Couldn\'t find user in context:', context);
      // Giving the wheel back to our bot
      cb();
    }
  },
  
  merge(sessionId, context, entities, message, cb) {
		console.log("entities before merge:\n", entities);
        async.forEachOf(entities, (entity, key, cb) => {
            const value = firstEntityValue(entity);
            //console.error("Result", key, value);
            if (value != null && (context[key] == null || context[key] != value)) {

                switch (key) {
                    default:
                        cb();
                }
            }
            else
                cb();

        }, (error) => {
            if (error) {
                console.error(error);
            } else {
                console.log("Context after merge:\n", context);
                cb(context);
            }
        });
    },

	error(recipientId, context, error) {
        console.log(error.message);
    },

    /**** Add your own functions HERE ******/

  // fetch-weather bot executes
  fetchSymbol(sessionId, context, callback) {
    // Here should go the api call, e.g.:
    // context.forecast = apiCall(context.loc)
	console.log('Context', context);
    return new Promise(function(resolve, reject) {
      var entreprise = firstEntityValue(context)
      if (entreprise) {
		context.symbol = 'Goog' ; // we should call an API here
        delete context.missingSymbol;
		console.log('Context', context);
      } else {
        context.missingSymbol = true;
        delete context.symbol;
		console.log('Context', context);
      }
      return resolve(context);
	});
  },
};


const getWit = () => {
  return new Wit(Config.WIT_TOKEN, actions);
};

exports.getWit = getWit;

// bot testing mode
// http://stackoverflow.com/questions/6398196
if (require.main === module) {
  console.log("Bot testing mode.");
  const client = getWit();
  client.interactive();
}