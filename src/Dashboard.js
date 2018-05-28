import React from 'react';
import PropTypes from 'prop-types';

import './Dashboard.css';

class Dashboard extends React.Component{
    constructor(props){
        super(props);
        var reader = new FileReader();
        var obj;
        if(this.props.file){
            reader.onloadend(function(e){
                var text = reader.readAsText(this.props.file);
                obj = JSON.parse(text);
            });
        }
        this.state = {
            videoUrl: this.props.videoUrl,
            picUrl: this.props.picUrl, //'http://clips.vorwaerts-gmbh.de/VfE_html5.mp4',
            shiftX: 0,
            shiftY: 0,
            parentOffsetX: 0,
            parentOffsetY: 0,
            x1: obj ? obj.posX : 0,
            y1: obj ? obj.posY : 0,
            width: obj ? obj.width : 0,
            height: obj ? obj.width : 0,
            resolution: 0,
            resX: obj ? obj.resX : Number,
            resY: obj ? obj.resY : Number
        };
        this.initResize = this.initResize.bind(this);
        this.resizeElem = this.resizeElem.bind(this);
        this.resizeStop = this.resizeStop.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.getCoords = this.getCoords.bind(this);
        this.sendRes = this.sendRes.bind(this);
    }
    static props = {
        
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
                x1: this.state.x1,
                y1: this.state.y1,
                resX: this.state.resX,
                resY: this.state.resY,
                width: this.state.width,
                height: this.state.height
            })
        }).catch((err) => {
            console.log(err);
        });
    }
    getCoords(element) {
        var box = element.getBoundingClientRect();
            return {
                left: box.left + window.pageXOffset,
                top: box.top + window.pageYOffset,
                width: box.width,
                height: box.height
            };
    }
    initResize(event){
        event.preventDefault();

        let element, eW, eH;
        element = this.refs.content;
        eW = element.getBoundingClientRect().width;
        eH = element.getBoundingClientRect().height;
        this.setState({resolution: eW/eH});

        let resizeHandler, resizeHandlerCoords; 
        resizeHandler = this.refs.resizer;
        resizeHandlerCoords = this.getCoords(resizeHandler);
        
        this.setState({shiftX : event.clientX - resizeHandlerCoords.left});
        this.setState({shiftY : event.clientY - resizeHandlerCoords.top});

        console.log(this.state.shiftX, this.state.shiftY);

        document.addEventListener('mousemove', this.resizeElem);
        document.addEventListener('mouseup', this.resizeStop);

        resizeHandler.ondragstart = function() {
            return false;
        };
    }
    resizeElem(e){
        e.preventDefault();

        let element, parent, parentMain, parentMainBox, elementCoords, resizeHandler, resizeHandlerX, resizeHandlerY, resizeHandlerCoords, newHandlerPosX, newHandlerPosY;
        element = this.refs.content;
        resizeHandler = this.refs.resizer;
        resizeHandlerCoords = resizeHandler.getBoundingClientRect();
        resizeHandlerX = Math.round(resizeHandlerCoords.x);
        resizeHandlerY = Math.round(resizeHandlerCoords.y);
        parent = this.refs.dragContent;
        parentMain = this.refs.dragContentBox;
        parentMainBox = parentMain.getBoundingClientRect();
        

        newHandlerPosX = Math.round(e.clientX) - Math.round(this.state.shiftX)*.5 - parent.offsetLeft - parentMain.offsetLeft;
        newHandlerPosY = Math.round(e.clientY) - Math.round(this.state.shiftY)*.5 - parent.offsetTop - parentMain.offsetTop;
        console.log(resizeHandlerX, resizeHandlerY, newHandlerPosY - parentMain.offsetTop);

        if(newHandlerPosX - parentMain.offsetLeft >= parentMain.clientWidth - parentMain.offsetLeft - parent.offsetLeft){
            this.setState({
                resX: parentMain.clientWidth - this.state.x1,
                width: parentMain.clientWidth - this.state.x1
            });
        }else if(newHandlerPosY - parentMain.offsetTop >= parentMain.clientHeight - parentMain.offsetTop - parent.offsetTop){
            this.setState({
                resY: parentMain.clientHeight - this.state.y1,
                height: parentMain.clientHeight - this.state.y1
            });
        }else{
            this.setState({
                resX: newHandlerPosX,
                width: newHandlerPosX
            });
            this.setState({
                resY: this.state.resolution > 1 ? this.state.resX / this.state.resolution : this.state.resX * this.state.resolution,
                height: this.state.resolution > 1 ? this.state.width / this.state.resolution : this.state.width * this.state.resolution
            });
        }
        
        
    }
    resizeStop(e){
        e.preventDefault();
        this.sendRes();
        document.removeEventListener('mousemove', this.resizeElem);
        document.removeEventListener('mouseup', this.resizeStop);
    }
    onMouseDown(e){
        e.preventDefault();
        let element = this.refs.dragContent;

        let coords = this.getCoords(element);
        this.setState({shiftX : e.clientX - coords.left});
        this.setState({shiftY : e.clientY - coords.top});
        console.log(this.state.shiftX, this.state.shiftY);

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
                x1: 0,
                y1: 0
            });
        }else if(newElementPosX + elementBox.width > parentBox.width && newElementPosY < 0){
            this.setState({
                x1: parentBox.width - elementBox.width,
                y1: 0
            });
        }else if(newElementPosX + elementBox.width > parentBox.width && newElementPosY + elementBox.height > parentBox.height){
            this.setState({
                x1: parentBox.width - elementBox.width,
                y1: parentBox.height - elementBox.height
            });
        }else if(newElementPosX < 0 && newElementPosY + elementBox.height > parentBox.height){
            this.setState({
                x1: 0,
                y1: parentBox.height - elementBox.height
            });
        }else if(newElementPosX < 0){
            this.setState({
                x1: 0,
                y1: newElementPosY
            });
        }else if(newElementPosY < 0){
            this.setState({
                x1: newElementPosX,
                y1: 0
            });
        }else if(newElementPosX + elementBox.width > parentBox.width){
            this.setState({
                x1: parentBox.width - elementBox.width,
                y1: newElementPosY
            });
        }else if(newElementPosY + elementBox.height > parentBox.height){
            this.setState({
                x1: newElementPosX,
                y1: parentBox.height - elementBox.height
            });
        }else{
            this.setState({
                x1: newElementPosX,
                y1: newElementPosY
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

                            <div
                            className="drag-content" 
                            ref="dragContent"
                            style={{
                                left : this.state.x1,
                                top : this.state.y1,
                                width: this.state.width !== 0 ? this.state.width : null,
                                height: this.state.height !== 0 ? this.state.height : null
                            }}
                            >   
                                <div id="wrapper" 
                                ref="content"
                                onMouseDown={e => this.onMouseDown(e)}
                                >
                                    <video
                                    loop controls src={this.state.videoUrl} type="video/mp4"> 
                                        {message}
                                    </video>
                                </div>
                                <div className="resize-handlebar" 
                                ref="resizer" 
                                onMouseDown={e => this.initResize(e)}
                                style={{
                                    left: this.state.resX !== 0 ? this.state.resX : null,
                                    top: this.state.resY !== 0 ? this.state.resY : null,
                                }}
                                ></div>
                            </div>
                                
                        : this.state.picUrl ?

                                <div
                                style={{
                                left : this.state.x1,
                                top : this.state.y1
                                }}
                                className="drag-content"
                                ref="dragContent"
                                >   
                                    <div id="wrapper" 
                                    ref="content" 
                                    onMouseDown={e => this.onMouseDown(e)}
                                    >
                                        <img 
                                        alt=""
                                        src={this.state.picUrl}                              
                                        />
                                    </div>
                                    <div className="resize-handlebar" 
                                    ref="resizer" 
                                    onMouseDown={e => this.initResize(e)}
                                    style={{
                                        left: this.state.resX,
                                        top: this.state.resY
                                    }}
                                    ></div>
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