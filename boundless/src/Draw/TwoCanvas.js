import React from "react";
import {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import Two from "two.js";
import {current} from "@reduxjs/toolkit";
import ReactDOM from 'react-dom'
import {useSelector} from "react-redux";
import {selectRGB} from "../Redux/rSlicePenOptions";
import svg from "two.js/src/renderers/svg";



//TODO: Look into reducing re-rendering


const radius = 40;

let TEXT_RENDERING_BOOL = true;
const TwoCanvas = ({toolInUse}) => {




    /** Currently supported Tools:
     *  Pen
     *  All-Canvas Delete
     *  Place Circle
     *  Place Rectangle
     *  Change Color (implemented in CanvasPage)
     *
     *
     *
     * **/

        //TODO: make 'clear' tool a parameter that sets a new state -> triggers useEffect -> sets state as false
        // in order to preserve last-used-tool


    const svgRef = useRef(null);
    const penColor = useSelector(selectRGB)

    //Creates the 'two' object w/o mounting it to the actual DOM
    const [two, setTwo] = useState(
        new Two({fullscreen:true, autostart:true})
    );

    //Determines whether TwoCanvas has been appended onto svgRef
    const [isLoaded, setIsLoaded] = useState(false);

    //Stores mouse coordinates
    const [mouse, setMouse] = useState([0,0]);

    //Boolean for if the mouse is currently down
    const [inUse, setInUse] = useState(false);

    /** TOOLS **/
    const [isPenning, setIsPenning]  = useState(false);
    const [isStickering, setIsStickering] = useState(false);



    /** QUICK TIPS
     *  - So the wait I implemented this is primarily with
     *  useEffect + Callback pairings.
     *
     *  useEffect is called EVERY TIME THE DOM IS RENDERED and returns
     *  when the dom is dismounted.
     *
     *  useCallbacks are useEffects that only render when any of their dependencies
     *  change, so best practice is to have them depend on certain state booleans
     *
     *
     * **/






    //Appends twoCanvas and approves loading
    useEffect(() => {
        if (!svgRef.current || isLoaded) {
            return;
        }
        console.log(("Loaded Two"));
        setTwo(two.appendTo(svgRef.current)


        );
        setIsLoaded(true);
    });

    //Checks if Delete was called
    useEffect(()=>{
        if(!svgRef.current){
            return
        }

        if(toolInUse === 'wipeCanvas'){
            two.clear();
            two.update();
            setTwo(two);
            toolInUse = 'pen'
        }
    })

    //Currently not being used, but very fun
    function getRandomColor() {
        return 'rgb('
            + Math.floor(Math.random() * 255) + ','
            + Math.floor(Math.random() * 255) + ','
            + Math.floor(Math.random() * 255) + ')';
    }

    /** Shape Stuff**/





    //Callback for when mouse is down
    const startPaint = useCallback((event) => {
        //console.log("startPaint CAlled");
        const coordinates = getsCoordinates(event);
        //console.log("getsCoordiantes returned called")
        if (coordinates) {
            setMouse(coordinates);
            setInUse(true);
        }
    }, []);

    //useEffect for startPaint
     useEffect(() => {
        if (!svgRef.current) {
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
            const canvas = two.renderer.domElement;
            //console.log("startPaint event added")

            canvas.addEventListener('mousedown', startPaint);
            return () => {
                canvas.removeEventListener('mousedown', startPaint);
            };
    }, [startPaint, two]);

    //instantiates newMouse and draws lines
    const paint = useCallback(
        (event ) => {
            //console.log("Paint Called")
            if (inUse) {
                //console.log("Paint Called w/inUse as true;")
                const newMouse = getsCoordinates(event);
                if (mouse && newMouse && (toolInUse === 'pen')) {
                    drawLine(mouse, newMouse);
                    setMouse(newMouse);
                }
            }
        },
        [inUse, mouse, toolInUse]
    );

    //useEffect for paint
    useEffect(() => {
        if (!svgRef.current) {
            //console.log("paint Ev. Handle notGood")
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
            //console.log("mouseMove event added")
            const canvas = two.renderer.domElement;
            canvas.addEventListener('mousemove', paint);
            return () => {
                canvas.removeEventListener('mousemove', paint);
            };
    }, [paint, two]);

    //Triggers when the mouse is up or off the screen
    const exitPaint = useCallback(() => {
        if(toolInUse === 'pen') {
            setInUse(false);
            setMouse(undefined);
        }
    }, []);


    const dropShape = useCallback((event) => {
        console.log("getting to dropshape")
        //if(inUse) {
            console.log('useCallback called while in use');
                const newMouse = getsCoordinates(event);
                if(newMouse){
                    if(toolInUse === 'circle') {
                        console.log('Circle tool triggered');
                        const circ = two.makeCircle(newMouse[0], newMouse[1], radius);
                        circ.fill = penColor;
                        two.update();
                        console.log(penColor);
                        setTwo(two);

                    } else if(toolInUse === 'rectangle'){
                        console.log('Rectangle tool triggered')
                        const rect = two.makeRectangle(newMouse[0], newMouse[1], radius, radius);
                        rect.fill = penColor
                        two.update();
                        console.log(penColor);
                        setTwo(two);
                    }

                }

            //}


    }, [inUse, toolInUse, two, penColor]);

    const mouseUpCallback = useCallback( (event) => {


        //NOTE: In current implementation, it is the tool callback switches (mouseUpCallback,
        // mouseDownCallback, etc) that exit out of other tools, not the actual toolbar.
        exitPaint()
        switch(toolInUse){
            case "pen":
                //exitPaint();
                break;
                //Note: if stickers ever get online, this is where they should be thrown into
                // the callback functions
            case "circle":
                setInUse(true)
                dropShape(event);
                break;
            case "rectangle":
                setInUse(true)
                dropShape(event);
                break;
        }
    }, [inUse, setInUse, dropShape, exitPaint]);

    //useEffect for exitPaint
    useEffect(() => {
        if (!svgRef.current) {
            //console.log("MouseUp or MouseLeave Ev. Handle notGood")
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
            const canvas = two.renderer.domElement;
            //console.log("MouseUp & mouseLEave mounted");

                canvas.addEventListener('mouseup', mouseUpCallback);
                //canvas.addEventListener('mouseup', exitPaint);
                //canvas.addEventListener('mouseleave', exitPaint);
                //canvas.addEventListener('mouseup', dropShape);

            return () => {
                canvas.removeEventListener('mouseup', mouseUpCallback);
                //canvas.removeEventListener('mouseup', exitPaint);
                //canvas.removeEventListener('mouseleave', exitPaint);
                //canvas.removeEventListener('mouseup', dropShape);
            };
    }, [exitPaint, two, dropShape]);

    //Gets the coordinates of the mouse event
    const getsCoordinates = (event) => {
        if (!svgRef.current) {
            //console.log("getsCoordinates failed")
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
            //console.log("getsCoordinates called");
            const canvas = two.renderer.domElement;

        //console.log("x: "+event.pageX +" y: "+event.offsetY);

        //Coordinate notes:
        // Don't use canvas or svgRef.current (which would normally make sense)
        // because canvas is modded via Two and doesn't work and
        // svgRef.current is just an empty component that I stick the two SVG onto



        //COORDINATES THAT WORK (3/7) (for some reason)
        //
        //
        //
        // x: event.pageX, y: event.offsetY
        return [event.pageX,  event.offsetY]
    };

    const drawLine = (originalMousePosition,  newMouse) => {
        if (!svgRef.current) {
            //console.log("drawLine failed")
            //console.log("SVG Status: "+(svgRef.current != null));
            return;
        }
        const path = two.makeLine(
                    originalMousePosition[0],
                    originalMousePosition[1],
                    newMouse[0],
                    newMouse[1]);
        path.stroke = penColor;
        path.curved = true;
        two.update();
        setTwo(two);

    };



    return (
        <div>
            {/*<text>{toolInUse}</text>*/}
            <div ref={svgRef}>
            </div>
        </div>
    )
}
export default TwoCanvas;



