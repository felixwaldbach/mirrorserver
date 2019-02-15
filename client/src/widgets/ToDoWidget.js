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

var mylist = [];

class ToDoWidget extends Component {

  constructor(props) {
      super(props);
      this.state = {
        wunderlist_settings: [],
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
          addListToUI(data);

          this.intervalID = setInterval(
            () => this.getSubtasks(),
            300000 // every 5 minutes
          );
      });

      socket.emit('wunderlist_settings', {
          message: "send me credentials please!"
      });

      const addListToUI = data => {
          if(data) {
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
                for(x in lists) {
                  if(lists[x].title === this.state.wunderlist_settings.todo_list) {
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

  async getSubtasks () {
    console.log("getSubtasks");
    let accessToken = this.state.wunderlist_settings.client_secret;
    let client_id = this.state.wunderlist_settings.client_id;
    console.log(accessToken);
    console.log(client_id);
    console.log(this.state.list_id);
    fetch("https://a.wunderlist.com/api/v1/tasks?list_id="+this.state.list_id, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "X-Access-Token": accessToken,
          "X-Client-ID": client_id
        },
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      this.setState({mylist: response});
    })
    .catch(function(err) {
      console.log(err);
    });
  }

  render() {
    mylist = this.state.mylist;
    mylist.slice(0, 5);
    return (
        <div className="todo-container">
          <h2>To Do List</h2>
          {mylist.length > 0 ?
            <div>
              {mylist.map((item, index) => {
                  return(
                    <div key={index}>
                      {index < 7 ? <li>{item.title}</li>: null}
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
