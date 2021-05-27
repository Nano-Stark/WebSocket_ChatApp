import * as AuthActions from './authActions';

//CONNECTING ON PAGE LOAD IF ALREADY LOGGED IN, aad token to connet to server when theres token

/* global $ */
export const setupSocket = (token, userId) => {
    return dispatch => {
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
        if (token){
            //Add already logged in use
            socket.send(JSON.stringify({
                type: 'CONNECT_WITH_TOKEN',
                data: {
                    token: token,
                    userId: userId
            }
            }))
            dispatch({
                type: 'SETUP_SOCKET',
                payload: socket,
            });
        }else{
        dispatch({
            type: 'SETUP_SOCKET',
            payload: socket,
        });
    }

    }
/*export const setupSocket = () => {
    return dispatch => {
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
        dispatch({
            type: 'SETUP_SOCKET',
            payload: socket,
        });

    }*/

    socket.onmessage = (message) => {
        console.log('Message', JSON.parse(message.data).data);
        let data = JSON.parse(message.data);
        switch (data.type){
            case 'LOGGEDIN':
                dispatch(AuthActions.loggedIn(data))
                break;
            //SEARCH FUNCTIONALITY
            case 'GOT_USERS':
                console.log(data);
                dispatch({
                    type: 'GOT_USERS',
                    payload: data.data.users
                });
                break;
            //CREATING NEW THREADS
            case 'ADD_THREAD':
                dispatch({
                    type: 'ADD_THREAD',
                    payload: data.data
                })
                break;
            case 'INITIAL_THREADS':
                dispatch({
                    type: 'INITIAL_THREADS',
                    payload: data.data
                })
                break;
            case 'GOT_MESSAGES':
                dispatch({
                    type: 'ADD_MESSAGES_TO_THREAD',
                    payload: {
                        threadId: data.threadId,
                        messages: data.messages
                    }
                })
                break;
            case 'ADD_MESSAGE_TO_THREAD':
                dispatch({
                    type: 'ADD_SINGLE_MESSAGE',
                    payload: {
                        threadId: data.threadId,
                        message: data.message
                    }
                })
                //id is from threadview, under render, return
                document.getElementById('main-view').scrollTop =  document.getElementById('main-view').scrollHeight;
            default:
                //do nothing
        }
    }

    
}
}