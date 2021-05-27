const WebSocket = require('ws');
var models = require('./server.js').models;

const ws = new WebSocket.Server({port: 8080});//server is port 800, localhost, client connects to
//this in chatAccctions

//TRACKING LOGGED IN USERS
const clients = [];

//DISCONNECTING SOCKET SESSION
const printClientCount = () => {
    /*console.log('Clients:', clients.length);*/
}

setInterval(printClientCount, 1000);

ws.on('connection', (ws) => {


    function getInitialThreads(userId){//line 50 and 98
        models.Thread.find({where: {}, include: 'Messages'}, (err, threads) => {
            if (!err && threads) {
                //Rendering msgs with user info
                threads.map((thread, i) => {
                    models.User.find({where: {id: {inq: thread.users}}}, (err3, users) => {
                        console.log("thread.profile", users);//this was meant to show up in my react props in the browser component
                        thread.profiles = users;
                        if(i === threads.length - 1){
                            ws.send(JSON.stringify({
                                type: 'INITAL_THREADS',
                                data: threads,
                            }));
                        }
                    });
                })
               
            }
        });
    }

    //GET THREADS ON PAGE LOAD
    /*function getInitialThreads(userId){//line 50 and 98
        models.Thread.find({where: {}, include: 'Messages'}, (err, threads) => {
            if (!err && threads) {
                ws.send(JSON.stringify({
                    type: 'INITAL_THREADS',
                    data: threads
                }))
            }
        })
    }*/

    function login(email, pass){
        console.log('EM', email, pass);
        models.User.login({email: email, password: pass}, (err, result) => {
            if(err){
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    error: err
                }));
            }else{
                models.User.findOne({where: {id: result.userId}, include: 'Profile'}, (err2, user) => {
                    if(err2){
                        ws.send(JSON.stringify({
                            type: 'ERROR',
                            error: err2
                        }));
                    }else{
                        //DISCONNECTING SOCKET SESSIONS, assigning id ti sockets
                        ws.uid = user.id + new Date().getTime().toString();
                        //TRACKING USERS, allows using multiple instance of websocket
                        //keeps track of all connected users
                        const userObject = {
                            id: user.id,
                            email: user.email,
                            ws: ws
                        };
                        clients.push(userObject);
                        console.log("Current client", clients);

                        getInitialThreads(user.id);
                        ws.send(JSON.stringify({
                            type: 'LOGGEDIN',
                            data: {
                                session: result,
                                user: user
                            },
                        }));
                    }
                })
            }
        })
    }

    //DISCONEECTIING SOCKET SESSIONS
    ws.on('close', (req) => {
        console.log('Request close', req);
        //console.log(c.ws._closeCode, c.id);
        let clientIndex = -1;
        clients.map((c,i) => {
            if (c.ws._closeCode === req){
                clientIndex = i;
            }  
        });
        if (clientIndex > -1){
            clients.splice(clientIndex, 1);
        }
    });

    ws.on('message', (message) => {
        console.log("Got message", JSON.parse(message));
        let parsed = JSON.parse(message);//downwards was used in modelling, video:writing account
        if (parsed) {//based on logic part one [19:30]
            switch(parsed.type){
                case 'SIGNUP':
                    models.User.create(parsed.data, (err, user) => {
                        if (err) {
                            ws.send(JSON.stringify({
                                type: 'ERROR',
                                error: err
                            }));
                        }else{
                            models.Profile.create({
                                userId: user.id,
                                name: parsed.data.name,
                                email: parsed.data.email
                            }, (profileErr, profile) => {

                            })
                        }
                    });
                    break;
                
                case 'CONNECT_WITH_TOKEN':
                    models.User.findById(parsed.data.userId, (err2, user) => {
                        if (!err2 && user) {
                            ws.uid = user.id + new Date().getTime().toString();
                            const userObject = {
                                id: user.id,
                                email: user.email,
                                ws: ws
                            };
                            clients.push(userObject);
                            //console.log("Current client", clients);
                            
                            //console.log(userObject.ws._receiver, userObject.ws._sender)
        /*
                            ws.send(JSON.stringify({
                                type: 'LOGGEDIN',
                                data: {
                                    session: result,
                                    user: user
                                },
                            }));*/
                        }
                    });
                    break;
                
                case 'LOGIN':
                    login(parsed.data.email, parsed.data.password);
                    break;
                //SEARCHING FUNCTIONALITY
                case 'SEARCH':
                    console.log('Searching for', parsed.data);
                    models.User.find({where: {email: {like: parsed.data}}}, (err, users) => {
                        if (!err && users){
                            ws.send(JSON.stringify({
                                type:'GOT_USERS',
                                data: {
                                    users: users
                                }
                            }));
                        }
                    });
                    break;
                //CREATING NEW THREADS
                case 'FIND_THREAD':
                    models.Thread.findOne({where: {
                        and: [
                            {users: {like: parsed.data[0]}},
                            {users: {like: parsed.data[1]}},
                        ],
                    }}, (err, thread) => {
                        if (!err && thread){
                            ws.send(JSON.stringify({
                                type: 'ADD_THREAD',
                                data: thread,
                            }));
                        } else {
                            models.Thread.create({
                                lastUpdated: new Date(),
                                users: parsed.data,
                            }, (err2, thread) => {
                                
                                if (!err2 && thread) {
                                    console.log('Clients filter', clients.filter(u => thread.users.indexOf(u.id.toString()) > -1));
                                    //this part gave me problem, i had to use tostring() on the u.id
                                    clients.filter(client => thread.users.indexOf(client.id.toString()) > -1).map(client => {
                                        console.log('Clients', client);
                                        client.ws.send(JSON.stringify({
                                            type: 'ADD_THREAD',
                                            data: thread,
                                        }));
                                    });
                                }
                            });
                        }
                    });
                    break;
                case 'THREAD_LOAD':
                    models.Message.find({where: {
                        threadId: parsed.data.threadId,
                    },
                    order: 'date DESC',
                    skip: parsed.data.skip,
                    limit: 10,
                    }, (err2, messages) => {
                        if (!err2 && messages) {
                            ws.send(JSON.stringify({
                                type: 'GOT_MESSAGES',
                                threadId: parsed.data.threadId,
                                messages: messages,
                            }))
                        }
                    })
                    break;  
                case 'ADD_MESSAGE':
                    models.Thread.findById(parsed.threadId, (err2, thread) => {
                        if (!err2 && thread) {
                            models.Message.insert(parsed.message, (err3, message) => {
                                if (!err3 && message) {
                                    clients.filter(client => thread.users.indexOf(client.id.toString()) > -1).map(client => {
                                        client.ws.send(JSON.stringify({
                                            type: 'ADD_MESSAGE_TO_THREAD',
                                            threadId: parsed.threadId,
                                            message: message,
                                        }));
                                    });
                                }
                            });
                        }
                    });
                    break;
                default:
                    console.log('Nothing to see here');
            }
        }
    });  
})