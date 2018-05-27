import React, { Component } from 'react';
import {Route, Switch, Redirect, withRouter} from 'react-router';

import Dashboard from './Dashboard';
import './Main.css';

class Main extends Component {
  constructor(props){
    super(props);
    this.state = {
      url: '',
      isSubmitted: false
    };
    this.validateUrl = this.validateUrl.bind(this);
  }
  handleChange(e){
    this.setState({url: e.target.value});
  }
  validateUrl(e){
    e.preventDefault();
    let url = this.state.url;
    if (url && url.length > 2 && url.match(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/)){
      console.log(url);
      this.setState({isSubmitted: true});
    }else if(!url || url === null || url === undefined){
      this.setState({isSubmitted: false});
    }
  }
  render(){
    const form = (
      <form onSubmit={(e) => {this.validateUrl(e)}}>
        <input type="text" id="content-form" onChange={(e) => {this.handleChange(e)}} />
        <button className="button content-button">Choose video or image to upload</button>
    </form>);
    const {url} = this.state;
    const {isSubmitted} = this.state;
    console.log(isSubmitted);
    return (
      <div className="">
        {
          isSubmitted ?
            <Route render={({...props}) => <Dashboard {...props} contentUrl={url}/>} />
          :
            form
        }    
      </div>
    );
  }
}

export default Main;
