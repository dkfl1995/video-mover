import React, { Component } from 'react';
import {Route, Switch} from 'react-router';

import Dashboard from './Dashboard';
import './Main.css';

class Main extends Component {
  constructor(props){
    super(props);
    this.state = {
      url: '',
      isSubmitted: false,
      isPicUrl: false,
      isVideoUrl: false
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
      if(url.match(/.(jpg?|jpeg?)$/)){
        console.log("its picture");
        this.setState({
          isSubmitted: true,
          isPicUrl: true
        });
      }else if(url.match(/.(mp4?)$/)){
        console.log("its video");
        this.setState({
          isSubmitted: true,
          isVideoUrl: true
        });
      }else{
        this.refs.warn.innerHTML = "Your link does not any of direct link type nor video/mp4 or image/*. Check, or change it on another valid direct source link";
      }
    }else if(!url || url === null || url === undefined){
      this.setState({isSubmitted: false});
    }
  }
  render(){
    const form = (
      <form onSubmit={(e) => {this.validateUrl(e)}}>
        <input type="text" id="content-form" onChange={(e) => {this.handleChange(e)}} />
        <button className="button content-button">Choose video or image to upload</button>
        <div ref="warn"></div>
      </form>
    );
    const {url} = this.state;
    const {isSubmitted} = this.state;
    console.log(isSubmitted);
    return (
      <div className="">
        <Switch>
        {
          !isSubmitted ?
            form
            
          :
            <Route render={({...props}) => {
              if(this.state.isPicUrl){
                return <Dashboard {...props} picUrl={url} />
               }else if(this.state.isVideoUrl){
                return <Dashboard {...props} videoUrl={url} />
               }else{
                null
               }
            }} />
        }  
        </Switch>
        
      </div>
    );
  }
}

export default Main;
