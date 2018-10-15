import React, {Component} from 'react';
import $ from 'jquery';

class QuotesWidget extends Component {

  constructor(props) {
      super(props);
      this.state = {
        quote: "",
        author: ""
      }
  }

  componentDidMount() {
    this.callApi()
        .then(res => this.setState({response: res}))
        .catch(err => console.log(err));

    this.intervalID = setInterval(
      () => this.callApi()
          .then(res => this.setState({response: res}))
          .catch(err => console.log(err)),
      3600000 // 1 hour = 3600 seconds = 3600000 milliseconds
    );
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }


  callApi = async () => {
    //https://talaikis.com/random_quotes_api/
    //reload quote every 2 hour

    $.ajax({
      url: "https://talaikis.com/api/quotes/random",
      dataType: 'json',
      cache: false,
      type: "GET",
      success: function(data) {
        this.setState({quote: JSON.stringify(data.quote)});
        this.setState({author: JSON.stringify(data.author)});
      }.bind(this),
      error: function(xhr, status, err){
        console.log(err);
      }
    });

  }

    render() {

        return (
            <div className="quotes-container">
              <span>{this.state.quote} - {this.state.author}</span>
            </div>
        );
    }
}

export default QuotesWidget;
