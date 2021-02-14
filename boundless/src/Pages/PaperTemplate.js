import React, { Component } from 'react'

import {
    View,
    Layer,
    Group,
    Path,
    Circle,
    Ellipse,
    Rectangle,
    PointText,
    Tool,
} from 'react-paper-bindings'
import withPenTool from "../AdHoc/withPenTool";
import {compose} from "redux";



const PaperTemplate = ({ activeTool, circles, rectangles, width, height, props }) => {

    return (
        <View activeTool={activeTool} width={width} height={height}>
            <Layer>
                {circles.map(circle => <Circle {...circle} />)}
            </Layer>
            <Layer>
                {rectangles.map(rectangle => <Rectangle {...rectangle} />)}
            </Layer>
            <Layer>
                <Rectangle
                    center={[width / 2, height / 2]}
                    fillColor={'#222222'}
                    opacity={0.8}
                    size={[320, 120]}
                />
                <PointText
                    content={'PaperTemplate.js'}
                    fillColor={'white'}
                    fontFamily={'Courier New'}
                    fontSize={30}
                    fontWeight={'bold'}
                    justification={'center'}
                    point={[(width / 2) + 40, (height / 2) + 10]}
                />
            </Layer>
            <Tool
                active={activeTool === 'pen'}
                name={'pen'}
                onMouseDown={props.penToolMouseDown}
                onMouseDrag={props.penToolMouseDrag}
                onMouseUp={props.penToolMouseUp}
            />
        </View>

    );
}

export default compose(
 withPenTool,
)(PaperTemplate);
