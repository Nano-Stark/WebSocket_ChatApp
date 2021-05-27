const defaultState = {
    socket: null,
    message: '',
    threads: [],
    currentThread: '',
    //SEACH FUNCTIONALITY
    users: []
}

const chat = (state=defaultState, action) => {
    switch(action.type) {
        case 'SETUP_SOCKET':
            return {
                ...state,
                socket: action.payload,
            }
        case 'GOT_USERS':
            console.log('Getting Users', action.payload);
            return {
                ...state,
                users: action.payload
            }
        case 'ADD_THREAD':
            return {
                ...state,
                //threads: state.threads.concat(action.payload)
                //GETTING THREADS ON PAGE LOAD
                // the below code was to avoid multiple instance of threads dsiplay,
                //but i had no such issue like the tutor did
                threads: state.threads.filter(t => t.id === action.payload.id).length === 0 ? 
                state.threads.concat(action.payload)
                : state.threads
            }
        case 'INITIAL_THREADS':
            return {
                ...state,
                threads: action.payload
            }
        case 'ADD_MESSAGES_TO_THREAD':
            return {
                ...state,
                threads: state.threads.map(t => {
                    if (t.id === action.payload.threadId){
                        return {
                            ...t,
                            Messages: action.payload.messages.concat(t.Messages)
                        }
                    }else {
                        return t
                    }
                })
            }
        case 'ADD_SINGLE_MESSAGE':
            return {
                ...state,
                threads: state.threads.map(thread => {
                    if (thread.id === action.payload.threadId) {
                        return {
                        ...thread,
                        Messages: thread.Messages.concat(action.payload.message)
                        }
                    }else {
                        return thread
                    }
                })
            }
        default:
            return state
    }
}

export default chat;