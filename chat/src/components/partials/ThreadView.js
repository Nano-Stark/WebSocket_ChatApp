import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router-dom';

//rendering msgs to client side
import Message from './Message';

class ThreadView extends Component {

    //CONNECTING PAGE LOAD IF ALREADY LOGED IN
    componentDidMount(){
        this.init();
    }
    componentDidUpdate(props) {
        if (props.match.params.threadId !== this.props.match.params.threadId){//checks if threads been changed
            //this means after this component update, if the current threadId changes, do something
            this.init();
            
        }
    }

    init = () => {
        let currentThread = this.props.threads.filter(t => t.id === this.props.match.params.threadId)[0];
            if (currentThread && this.props.socket.readyState){
                console.log('ThreadView', currentThread, this.props.socket);
                let skip = currentThread.Messages || 0;
                this.props.socket.send(JSON.stringify({
                    type: 'THREAD_LOAD',
                    data: {
                        threadId: this.props.match.params.threadId,
                        skip: skip
                    }
                }))

            }

        }

    render() {
        return (
            <div className='main-view' id='main-view'>
                {/**rendering msgs to client side, use created
                 *  threads to uniquely identify each message of diferent users */}
                 {this.props.threads.filter(thread => thread.id === this.props.match.params.threadId).map((thread, i) => {
                     if(thread !== undefined && thread.Messages !== undefined) {
                         console.log('thread from threadview', thread, 'thread message', thread.Messages);
                     return (
                         <div className='message-container' key={i}>
                             {thread.Messages.map((msg, mi) => {
                                 if (msg !== null || undefined) {
                                     return (
                                        <Message msg={msg} key={mi} profile={this.props.users.filter(u => u.id === msg.userId)[0]}/>
                                     )
                                }
                             })}
                        </div>
                     )
                    }
                 })}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    ...state.auth,
    ...state.chat
})

const mapDispatchToProps = dispatch => ({

})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(ThreadView));