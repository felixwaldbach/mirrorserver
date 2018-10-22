import React, {Component} from 'react';
import WunderlistSDK from 'wunderlist';

var lists = [];

class ToDoWidget extends Component {

  constructor(props) {
      super(props);
      this.state = {
        lists: []
      }
      var wunderlistAPI = new WunderlistSDK({
        'accessToken': '9f9ddbe9ad76533351fe0ca2a8f98207d748462e33970694ccd27fa8d2a1',
        'clientID': 'cc357d122b2db83be2e1'
      });
      wunderlistAPI.http.lists.all()
        .done(function (lists) {
          console.log(lists);
          this.setState({lists: lists});
        }.bind(this))
        .fail(function () {
          console.error('there was a problem');
        });
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
