import React from 'react';
import PropTypes from 'prop-types';

import './Dashboard.css';

class Dashboard extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            videoUrl: this.props.videoUrl,
            picUrl: this.props.picUrl, //'http://clips.vorwaerts-gmbh.de/VfE_html5.mp4',
            shiftX: Number,
            shiftY: Number,
            parentOffsetX: Number,
            parentOffsetY: Number,
            x: Number,
            y: Number
        };
        this.initResize = this.initResize.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.getCoords = this.getCoords.bind(this);
        this.sendRes = this.sendRes.bind(this);
    }
    componentDidMount(){
        // window.addEventListener('beforeunload', this.sendRes);
    }
    componentWillUnmount(){
        // this.sendRes();
        // window.removeEventListener('beforeunload', this.sendRes);
    }
    sendRes(){
        let link;
        if(this.props.videoUrl){ 
            link = this.state.videoUrl; 
        }else if(this.props.picUrl){
            link = this.state.picUrl;
        }
        fetch('http://localhost:3001',{
            mode: "no-cors",
            method: "POST",
            body: JSON.stringify({
                url: link,
                posX: this.state.x,
                posY: this.state.y
            })
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
    initResize(e){
        let element = this.refs.content;
        element.addEventListener('mousemove', this.resizeElem);
        element.addEventListener('mousedown', this.resizeStop);
    }
    resizeElem(event){
        
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
        e.stopPropagation();
        let element = this.refs.dragContent;
        let parent = this.refs.dragContentBox;

        let parentBox = parent.getBoundingClientRect();
        let elementBox = element.getBoundingClientRect();

        let newElementPosX = Math.round(e.clientX) - Math.round(this.state.shiftX) - parent.offsetLeft;
        let newElementPosY = Math.round(e.clientY) - Math.round(this.state.shiftY) - parent.offsetTop;

        if(newElementPosX < 0 && newElementPosY < 0){
            this.setState({
                x: 0,
                y: 0
            });
        }else if(newElementPosX + elementBox.width > parentBox.width && newElementPosY < 0){
            this.setState({
                x: parentBox.width - elementBox.width,
                y: 0
            });
        }else if(newElementPosX + elementBox.width > parentBox.width && newElementPosY + elementBox.height > parentBox.height){
            this.setState({
                x: parentBox.width - elementBox.width,
                y: parentBox.height - elementBox.height
            });
        }else if(newElementPosX < 0 && newElementPosY + elementBox.height > parentBox.height){
            this.setState({
                x: 0,
                y: parentBox.height - elementBox.height
            });
        }else if(newElementPosX < 0){
            this.setState({
                x: 0,
                y: newElementPosY
            });
        }else if(newElementPosY < 0){
            this.setState({
                x: newElementPosX,
                y: 0
            });
        }else if(newElementPosX + elementBox.width > parentBox.width){
            this.setState({
                x: parentBox.width - elementBox.width,
                y: newElementPosY
            });
        }else if(newElementPosY + elementBox.height > parentBox.height){
            this.setState({
                x: newElementPosX,
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
        let message = "Browser does not support any video/image type";
        return (
            <div>
                <div className="drag-content-box" ref="dragContentBox">
                    {
                        this.state.videoUrl ?
                            <video
                            className="drag-content" 
                            ref="dragContent"
                            style={{
                                left : this.state.x,
                                top : this.state.y
                            }}
                            loop controls >
                                <source
                                onMouseDown={e => this.onMouseDown(e)}
                                src={this.state.videoUrl} type="video/mp4" />
                                {message}
                            </video>
                        : this.state.picUrl ?
                            <div
                            ref="dragContent"
                            onMouseDown={e => this.initResize(e)}
                            style={{
                            left : this.state.x,
                            top : this.state.y
                            }}
                            className="drag-content"
                            >
                                <img 
                                onMouseDown={e => this.onMouseDown(e)}
                                alt=""
                                src={this.state.picUrl}
                                ref="content"
                                />
                            </div>
                        :
                        null
                    }
                    
                </div>
                <a href="/">Back</a>
            </div>
        );
    }
}

Dashboard.propTypes = {
    picUrl: PropTypes.string,
    videoUrl: PropTypes.string
}

export default Dashboard;