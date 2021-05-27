import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router-dom';

class Sidebar extends Component {
    state = {
        search: ''
    }

    search = () => {
            this.props.socket.send(JSON.stringify({
                type: 'SEARCH',
                data: this.state.search
            }))
    }

    //CREATING NEW THREADS AND SENDING TO RELEVANT CLIENTS
    findOrCreateThread = (id) => {
            this.props.socket.send(JSON.stringify({
                type: 'FIND_THREAD',
                data: [this.props.user.id, id]
            }))
    }

    render() {
        return (
            <div className='sidebar'>
                {/**SEARCH FUNCTIONALTY */}
                <div  className='search-container'>
                <div className='input-group'>
                    <input 
                        className='form-control'
                        placeholder='search...'
                        value={this.state.search}
                        onChange={e => {this.setState({search: e.target.value})
                    }}
                    />
                    <button id='search-button' className='btn btn-send input-group-append'
                        onClick={e => this.search()}><i className='zmdi zmdi-search' /></button>
                </div>
                </div>
                {/**SEARCHFUNCTIONALITY */}
                {this.state.search ? 
                    <ul className='thread-list'>
                    <label>Results</label>
                    {/**FILTER TO ACHIEVE NEW THREADING,so that it wont show my self, i.e it wont bring my credentials up in my search */}
                    {this.props.users && 
                    this.props.users.filter(u => u.id !== this.props.user.id).map((user, ui) => {
                        return (
                            <li key={ui}>
                                {/*<Link to ='/thread'>*//**CREATING NEW THREADS, use <a> */}
                                <a onClick={e => {
                                    e.preventDefault();
                                    this.findOrCreateThread(user.id);
                                }}>
                                    <i className="zmdi zmdi-account-circle" />
                                    <h5>{user.name}</h5>
                                    <p>{user.email}</p>
                                </a>
                                {/*</Link>*/}
                            </li>
                        )
                    })}
                    </ul>
                :
                <ul className='thread-list'>
                    <label>Messages</label>
                    {/**CREATING NEW THREADS */}
                    {this.props.threads.map((thread, threadIndex) => {
                        return (
                            <li key={threadIndex}>
                            {/*<Link to ='/thread'>*/}
                            {/**CONNECTING ON PAGE LOADING IF ALREADY LOGGED IN */}
                            <Link to={`/${thread.id}`}>
                                <i className="zmdi zmdi-account-circle" />
                                <h5>{thread.id}</h5>
                                {/*<h5>{this.props.user.id === thread.users[0] ? this.props.user.name : null}</h5>*/}
                                <p>this is the last message</p>
                            </Link>
                        </li>
                        )
                    })}
                    {/*<li>
                        <Link to ='/thread'>
                            <i className="zmdi zmdi-account-circle" />
                            <h5>Name</h5>
                            <p>this is the last message</p>
                        </Link>
                    </li>

                    <li>
                        <Link to ='/thread'>
                            <i className="zmdi zmdi-account-circle" />
                            <h5>Name</h5>
                            <p>this is the last message</p>
                        </Link>
                    </li>

                    <li>
                        <Link to ='/thread'>
                            <i className="zmdi zmdi-account-circle" />
                            <h5>Name</h5>
                            <p>this is the last message</p>
                        </Link>
                    </li>*/}
                </ul>
                }
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
)(withRouter(Sidebar));