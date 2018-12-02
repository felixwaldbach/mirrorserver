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
import socketIOClient from "socket.io-client";
import frontendConfig from '../frontendConfig';

var lists = [];

class ToDoWidget extends Component {

  constructor(props) {
      super(props);
      this.state = {
        lists: [],
        tasks: [],
        list_id: 370586319
      }
      var wunderlistAPI = new WunderlistSDK({
        'accessToken': '9f9ddbe9ad76533351fe0ca2a8f98207d748462e33970694ccd27fa8d2a1',
        'clientID': 'cc357d122b2db83be2e1'
      });
      //this method gets all lists
      wunderlistAPI.http.lists.all()
        .done(function (lists) {
          this.setState({lists: lists});
          let x;
          for(x in lists) {
            if(lists[x].id === this.state.list_id) {
              console.log(lists[x]);
            }
          }
        }.bind(this))
        .fail(function () {
          console.error('there was a problem');
        });
  }

  componentDidMount() {
      // WebSockets
      this.socket = socketIOClient(this.state.endpoint);
      this.socket.emit('send_wunderlist_settings', {
          message: "send me credentials please!"
      });

      this.socket.on('wunderlist_settings', function (data) {
          addListToUI(data);
      });

      this.intervalID = setInterval( () => {
          this.socket.emit('wunderlist_settings', {
              message: "send me credentials please!"
          })},
          3600000 // 1 hour = 3600 seconds = 3600000 milliseconds
      );

      const addListToUI = data => {
          if(data) {
            console.log(data);
          }
      };
  }

  render() {
    lists = this.state.lists;
    return (
        <div className="todo-container">
          {lists.map((item, index) => {
              return(
                <div key={index}>
                  {item.title}
                </div>
              )
            }
          )}
        </div>
    );
  }
}

export default ToDoWidget;
