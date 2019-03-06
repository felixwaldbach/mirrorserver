/*
First: Each user has to get a accessToken and clientID by registering his Smart Mirror on: https://www.wunderlist.com/login
Ass application url: www.google.de should be okay
Set Header: X-Access-Token: OAUTH-TOKEN X-Client-ID: CLIENT-ID
Endpoint to get tasks of a list: a.wunderlist.com/api/v1/tasks?list_id=INTEGER_ID_OF_List

1. get all lists with id of each list
2. get tasks of the wished lists with the id of the list
3. print all tasks or the first 10 tasks...
*/

import React, {Component} from 'react';
import WunderlistSDK from 'wunderlist';
import {socket} from '../frontendConfig';
import {getWunderlistTasks} from "../api/get";

var mylist = [];

class ToDoWidget extends Component {

    constructor(props) {
        super(props);
        this.state = {
            wunderlist_settings: [],
            list_name: "",
            lists: [],
            mylist: [],
            tasks: [],
            list_id: 0,
        }

    }

    componentDidMount() {
        socket.emit('send_wunderlist_settings', {
            message: "send me credentials please!"
        });

        socket.on('wunderlist_settings', function (data) {
            refreshList();
            addListToUI(data);
        });

        const refreshList = () => {
            this.setState({list_name: ""});
            this.setState({mylist: []});
        }

        const addListToUI = data => {
            if (data) {
                this.setState({wunderlist_settings: data});

                var wunderlistAPI = new WunderlistSDK({
                    'accessToken': this.state.wunderlist_settings.client_secret,
                    'clientID': this.state.wunderlist_settings.client_id
                });
                //this method gets all lists
                wunderlistAPI.http.lists.all()
                    .done(function (lists) {
                        this.setState({lists: lists});
                        let x;
                        for (x in lists) {
                            if (lists[x].title === this.state.wunderlist_settings.todo_list) {
                              this.setState({list_name: lists[x].title});
                              this.setState({list_id: lists[x].id});
                                // with list_id we get list items...
                                this.getSubtasks();
                            }
                        }
                    }.bind(this))
                    .fail(function () {
                        console.error('there was a problem');
                    });
            }
        };
    }

    async getSubtasks() {
        let response = await getWunderlistTasks(this.state.wunderlist_settings.client_secret, this.state.list_id, this.state.wunderlist_settings.client_id);
        if (response) this.setState({
            mylist: response
        });
    }

    render() {
        mylist = this.state.mylist;
        mylist.slice(0, 5);
        return (
            <div className="todo-container">
                {this.state.list_name ? <span id="todo-title">{this.state.list_name}</span>: <span id="todo-title">To Do List</span>}
                {mylist.length > 0 ?
                    <div>
                        {mylist.map((item, index) => {
                                return (
                                    <div key={index}>
                                        {index < 7 ? <li id="todo-items">{item.title}</li> : null}
                                    </div>
                                )
                            }
                        )}
                    </div>
                    : <span>Nothing to do - Well done!</span>}

            </div>
        );
    }
}

export default ToDoWidget;
