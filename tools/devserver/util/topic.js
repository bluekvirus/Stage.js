/**
 * Register Server-Sent Event
 *
 * Usage: server.topic(topics, subscriptionPath, op);
 *
 *     -- topics: true //subscribe to all topics
 *                ['foo', 'bar', ...] //subscribe to specified topics
 *
 *     -- subsciprtionPath: 'string' //subscribe to a specified url path
 *                          true //subscribe to all possible SSE paths
 *
 *     -- op: {} //options for Server-Sent Event
 *
 * @author Patrick Zhu
 * @created 8/28/2017
 */

var _ = require('underscore');

module.exports = function(server){

    

    server.topic = function(topics/*true or ['foo', 'bar', ...]*/, subscriptionPath, op/*{data: ..., {options for sse}}*/){
        
        //check whether subscriptionPath has been given
        if(!subscriptionPath || !_.isString(subscriptionPath)){
            op = subscriptionPath;
            subscriptionPath = true;
        }

        if(!op){
            op = {
                data: {
                    msg: 'This is the message for Server-Sent Event' + subscriptionPath + ' ' + (topics === true) ? '' : topics,
                }
            };
        }

        //check whether subscriptionPath is true
        if(subscriptionPath === true){

            if(topics === true){
                //broadcast to all paths and topics
                _.each(server.sse, function(ts, path){
                    _.each(ts, function(t){
                        server.sse[path][t].broadcast(op.data, op.options);
                    });
                });
            }else if(_.isArray(topics)){

                //broadcast to specific topics to all paths
                _.each(server.sse, function(ts, path){
                    _.each(topics, function(topic){
                        if(server.sse[path][topic]){
                            server.sse[path][topic].broadcast(op.data, op.options);
                        }
                    });
                });

            }else if(_.isString(topics)){

                _.each(server.sse, function(ts, path){
                    if(server.sse[path][topics]){
                        //broadcast to a specific topic
                        server.sse[path][topics].broadcast(op.data, op.options);
                    }
                });

            }else{
                throw new Error('server.topic::topics must be an array or string or TRUE...');
            }


        }else{
            //check whether to broadcast to all topics
            if(topics === true){

                //broadcast to all the topic in the path
                _.each(server.sse[subscriptionPath], function(topic){
                    topic.broadcast(op.data, op.options);
                });

            }else if(_.isArray(topics)){

                //broadcast to specific topics
                _.each(topics, function(topic){
                    server.sse[subscriptionPath][topic].broadcast(op.data, op.options);
                });

            }else if(_.isString(topics)){

                //broadcast to a specific topic
                server.sse[subscriptionPath][topics].broadcast(op.data, op.options);

            }else{
                throw new Error('server.topic::topics must be an array or string or TRUE...');
            }
        }
    };

};