'use strict';

import React from 'react';
import {withRouter, Link} from 'react-router-dom';
import PropTypes from 'prop-types';

import './Dashboard.css';

class Dashboard extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            url: this.props.contentUrl, //'http://clips.vorwaerts-gmbh.de/VfE_html5.mp4',
            videoPos: [Number,Number], 
            shiftX: Number,
            shiftY: Number,
            parentOffsetX: Number,
            parentOffsetY: Number,
            x: Number,
            y: Number
        };
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.getCoords = this.getCoords.bind(this);
        this.sendRes = this.sendRes.bind(this);
    }
    componentDidMount(){
        window.addEventListener('beforeunload', this.sendRes)
    }
    componentWillUnmount(){
        this.sendRes();
        window.removeEventListener('beforeunload', this.sendRes);
    }
    sendRes(){
        console.log('fetching')
        fetch('http://localhost:3001',{
            method: "POST",
            body: JSON.stringify({
                url: this.state.url,
                posX: this.state.x,
                posY: this.state.y
            })
        }).then((res) =>  {
            console.log(res);
        }).catch((err) => {
            console.log(err);
        });
    }
    getCoords(element) {
        var box = element.getBoundingClientRect();
            return {
                left: box.left + window.pageXOffset,
                top: box.top + window.pageYOffset
            };
    }
    onMouseDown(e){
        e.preventDefault();
        let element = this.refs.dragContent;

        let coords = this.getCoords(element);
        this.setState({shiftX : e.clientX - coords.left});
        this.setState({shiftY : e.clientY - coords.top});

        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        element.ondragstart = function() {
            return false;
        };
    }
    onMove(e) {
        e.preventDefault();
        let element = this.refs.dragContent;
        let parent = this.refs.dragContentBox;

        let parentBox = parent.getBoundingClientRect();
        let elementBox = element.getBoundingClientRect();

        let newElementPosX = e.clientX - this.state.shiftX - parent.offsetLeft;
        let newElementPosY = e.clientY - this.state.shiftY - parent.offsetTop;

        if(newElementPosX < 0){
            this.setState({
                x: 0,
                y: newElementPosY
            });
        }else if(newElementPosX + Math.round(elementBox.width) >= Math.round(parentBox.width)){
            this.setState({
                x: parentBox.width - elementBox.width,
                y: newElementPosY
            });
        }else if(newElementPosY < 0){
            this.setState({
                x: newElementPosX,
                y: 0
            });
            element.style.top = 0;
        }else if(newElementPosY + Math.round(elementBox.height) >= Math.round(parentBox.height)){
            this.setState({
                x: newElementPosX,
                y: parentBox.height - elementBox.height
            });
        }else if(newElementPosX < 0 && newElementPosY < 0){
            console.log("dbout")
            this.setState({
                x: 0,
                y: 0
            });
        }else if(newElementPosY < 0 && newElementPosX + elementBox.width >= Math.round(parentBox.width)){
            this.setState({
                x: parentBox.width - elementBox.width,
                y: 0
            });
        }else if(newElementPosX + Math.round(elementBox.width) >= Math.round(parentBox.width) && newElementPosY + Math.round(elementBox.height) >= Math.round(parentBox.height)){
            this.setState({
                x: parentBox.width - elementBox.width,
                y: parentBox.height - elementBox.height
            });
        }else{
            this.setState({
                x: newElementPosX,
                y: newElementPosY
            });
        }
    }
    onMouseMove(event){
        this.onMove(event);
        event.preventDefault();
    }
    onMouseUp(e){
        this.sendRes();
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        e.preventDefault();
        
    }
    render(){
        let message = "Browser does not support any video type except MP4";

        return (
            <div>
                <div className="drag-content-box" ref="dragContentBox">
                    <video
                    className="drag-content" 
                    onMouseDown={e => this.onMouseDown(e)}
                    ref="dragContent"
                    style={{
                        left : this.state.x,
                        top : this.state.y
                    }}
                    loop controls >
                        <source src={this.state.url} type="video/mp4" />
                        {message}
                    </video>
                </div>
                <a href="/">Back</a>
            </div>
        );
    }
}

Dashboard.propTypes = {
    contentUrl: PropTypes.string.isRequired
}

export default withRouter(Dashboard);