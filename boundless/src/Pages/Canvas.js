import React from "react";
import {useParams} from "react-router-dom";
import PaperTemplate from "./PaperTemplate";

import DEFAULT_IMAGE from './default.jpg'
const IMAGE_WIDTH = 1920
const IMAGE_HEIGHT = 870

class Canvas extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            imageSize: 720,
            mounted: false,
        }
        this._box = null
        this._request = null
    }

    resizeWindow = () => {
        if (!this._request) {
            this._request = requestAnimationFrame(this.resizePaper)
        }
    }

    resizePaper = () => {
        this.forceUpdate()
        this._request = null
    }

    setImageSize = ({ size }) => {
        this.setState({ imageSize: size })
    }

    componentDidMount() {
        this.setState({ mounted: true })
        window.addEventListener('resize', this.resizeWindow)
    }

    componentWillUnmount() {
        if (this._request) {
            cancelAnimationFrame(this._request)
            this._request = null
        }
        window.removeEventListener('resize', this.resizeWindow)
    }
    render(){
        const { imageSize, mounted} = this.state
        const box = this._box && this._box.getBoundingClientRect()
        return (
            <div className="Canvas" ref={ref => this._box = ref}>
                {mounted &&
                <PaperTemplate
                    imageWidth={IMAGE_WIDTH}
                    image={DEFAULT_IMAGE}
                    imageHeight={IMAGE_HEIGHT}
                    imageSize={imageSize}
                    width={box.width}
                    height={box.height}
                    setImageSize={this.setImageSize}
                />
                }
            </div>
        )
    }
}

 export default Canvas;
