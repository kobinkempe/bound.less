import React, {useCallback, useEffect, useRef, useState} from "react";
import Two from "two.js";
import {useDispatch, useSelector} from "react-redux";

//I get by with a little help(er) from my friends (me)
import {fillLine, LINE_RES, makePoint, useNumUndos, useTwo, useUndoQueue} from "./TwoHelpers";
import {PEN_TYPES} from "../Pages/CanvasPage";
import {useEventCallback} from "@material-ui/core";



//
const TwoCanvas = ({toolInUse,
                       wipe=false,
                       setWipe,
                       radius,
                       color,
                       undo,
                       setUndo,
                       redo,
                       setRedo,
                       penType=PEN_TYPES[0],
                   }) => {

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

    //TODO: Circle line-drawing where circles move out in opacity to edges
    //TODO: make 'clear' tool a parameter that sets a new state -> triggers useEffect -> sets state as false
    // in order to preserve last-used-tool
    //TODO: Look into reducing re-rendering

    /**
     * BUG LIST:
     * Create
     *
     *
     *
     * **/

    const svgRef = useRef(null);
    /*
    const undoTop = useSelector(getUndoTop)
    const undoL = useSelector(getUQLength);
     */


    const dispatch = useDispatch();

    //Creates the 'two' object w/o mounting it to the actual DOM
    const [two, setTwo] = useTwo();

    //Keeps track of the # of shapes that need to be removed from two
    //const [PGroup, setPGroup] = useState(0);

    //Keeps track of the # of undos completed;
    // const [doneUndos, setdoneUndos] = useState(0);
    // const [undoQueue, pushUndoQueue, setUndoQueue] = useUndoQueue();

    //Determines whether TwoCanvas has been appended onto svgRef
    const [isLoaded, setIsLoaded] = useState(false);

    //Stores mouse coordinates
    const [penArray, setPenArray] = useState([]);
    const [path, setPath] = useState(null);

    //Boolean for if the mouse is currently down
    const [penInUse, setPenInUse] = useState(false);
    const [touchID, setTouchID] = useState(-1);

    //Undo storage when Clear is used
    const [undidTwoStack, setUndidTwoStack] = useState([]);

    //Redo Queue
    const [redoStack, setRedoStack] = useState([]);
    const [lastItem, setLastItem] = useState(0);

    const isMouseDownOnlyTool = useCallback(()=>{
            return (toolInUse === 'circle' || toolInUse === 'rectangle'|| toolInUse === 'text'|| toolInUse === 'star');
        },
        [toolInUse]
    );


    /** TOOLS **/

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
        setTwo(two.appendTo(svgRef.current));

        setIsLoaded(true);
    }, []);

    //Wipe Tool
    useEffect(()=>{
        if(!svgRef.current){
            return
        }

        if(wipe){
            let items = [];
            // I really don't know about this here. I might be copying pointers to things that are soon to be
            // potentially deleted, idk how javascript works
            for(let item of two.scene.children){
                items.push(item);
            }
            if(items !== []){
                setUndidTwoStack([items].concat(undidTwoStack));
                two.clear();
                two.update();
                setTwo(two);
            }
            setWipe(false);
        }
    }, [two, wipe, undidTwoStack])

    const checkRedoStack = useCallback(()=>{
        if(lastItem === two.scene.children[-1]){
            return true;
        } else if(lastItem === undidTwoStack.length){
            return true;
        } else {
            setRedoStack([-1]);
        }

    }, [two, lastItem, undidTwoStack])

    //Undo Tool
    useEffect(() =>{
        if(!svgRef.current){
            return
        }

        if(undo){
            checkRedoStack();
            const l = two.scene.children.length;
            if(l === 0 && undidTwoStack !== []){
                two.add(undidTwoStack[0]);
                setUndidTwoStack(undidTwoStack.slice(1));
                setRedoStack(['clear'].concat(redoStack));
            } else {
                let removeItem = two.scene.children[l - 1];
                setRedoStack([removeItem].concat(redoStack));
                two.remove(two.scene.children[l - 1]);
            }
            two.update();
            setTwo(two);
            if(two.scene.children.length === 0){
                setLastItem(undidTwoStack.length);
            } else {
                setLastItem(two.scene.children[-1]);
            }
            setUndo(false);
        }

        // if(undo-doneUndos>0){
        //
        //
        //     //This number is the # of paths that need to be stripped to undo this action
        //     const lastPath = undoQueue[undoQueue.length-1];
        //     undoQueue.pop();
        //     setUndoQueue(undoQueue);
        //
        //     for(let j = 0; j<lastPath; ++j) {
        //         const l = two.scene.children.length;
        //         two.remove(two.scene.children[l - 1]);
        //         console.log("# of TwoSceneChild: " + two.scene.children.length)
        //     }
        //     console.log("Undo: "+undo+", undoTop: "+lastPath+", Remaining Children: "+two.scene.children.length);
        //     setdoneUndos(doneUndos+1)
        //     two.update();
        //     setTwo(two);
        //
        //
        // }
        // else if(undo <1){
        //     setdoneUndos(0);
        // }
    }, [undo, undidTwoStack, redoStack, checkRedoStack])

    //Redo Tool
    useEffect(() =>{
        if(!svgRef.current){
            return
        }

        if(redo){
            checkRedoStack();
            let item = redoStack[0];
            if(item !== -1){
                if(item === 'clear'){
                    setWipe(true);
                    setLastItem(undidTwoStack.length + 1);
                } else {
                    two.add(item);
                    setLastItem(item);
                }
                setRedoStack(redoStack.slice(1));
                two.update();
                setTwo(two);
            }
            setRedo(false);
        }
    }, [redo, redoStack, checkRedoStack])

    const dropShape = useCallback((coord) => {
        if (coord) {
            if (toolInUse === 'circle') {
                const circ = two.makeCircle(coord[0], coord[1], radius / 2);
                circ.fill = color;
                circ.noStroke();
                two.update();
                setTwo(two);
            } else if (toolInUse === 'rectangle') {
                const rect = two.makeRectangle(coord[0], coord[1], radius, radius);
                rect.fill = color;
                rect.noStroke();
                two.update();
                setTwo(two);
                //dispatch(loadUndo( 1))
            } else if (toolInUse === 'star'){
                const star = two.makeStar(coord[0], coord[1], radius, radius*2/5, 5);
                star.fill = color;
                star.noStroke();
                star.rotation = Math.PI
                two.update();
                setTwo(two);
            } else if (toolInUse === 'text'){

                // User clicks, types something, hits enter, and it shows up
                const text = two.makeText("Text", coord[0], coord[1]);
                text.size = 16;

                two.renderer.domElement.addEventListener('keyup', function(e) {
                    var c = String.fromCharCode(e.which);
                    if (e.keyCode === 46) { // keyCode for delete
                        text.value = text.value.slice(0, text.value.length - 1);
                    } else {
                        text.value += c;
                    }
                }, false);

                two.update();
                setTwo(two);
            }

            //pushUndoQueue(1);
        }
    }, [color, radius, toolInUse, two])

    const setPenOptions = useCallback((path)=>{
        path.noFill();
        path.stroke = color;
        path.curved = true;
        path.linewidth = radius;
        path.cap = 'round';
        path.join = 'round';
        switch (penType){
            case PEN_TYPES[0]:
                path.opacity = .1;
                break;
            case PEN_TYPES[1]:
                break;
            default:
                break;
        }

    }, [penType, color, radius])

    const start = useCallback((coords, thisTouchID) => {
        if(toolInUse === 'pen' && !penInUse){
            const point = makePoint(coords);
            setPenArray([point]);
            setTouchID(thisTouchID);
            setPenInUse(true);
            const mPath = two.makeCurve([], true);
            setPenOptions(mPath);
            setPath(mPath);
            two.update();
            setTwo(two);
        } else if(isMouseDownOnlyTool()){
            dropShape(coords);
        }
    }, [toolInUse, penInUse, dropShape, two, setPenOptions])

    const move = useCallback((coords, thisTouchID) => {
        if(penInUse && (toolInUse === 'pen') && (thisTouchID === touchID)){
            if(penType === PEN_TYPES[2]){
                setPenArray([penArray[0], makePoint(coords)]);
            } else {
                setPenArray(penArray.concat(makePoint(coords)));
            }
            path.vertices = penArray;
            two.update();
            setTwo(two);
        }
    }, [toolInUse, touchID, penInUse, penArray, path, two, penType])

    const end = useCallback((coords, thisTouchID, nextTouch=false, nextTouchID=false) => {
        if(penInUse && (thisTouchID === touchID)){
            setPenInUse(false);
            setPenArray([]);
            /**
             * Stuff that's done when the mouse/touch leaves the canvas
             * Most importantly, the lineGroup needs to be passed to
             * the undo stack
             */
            // if(PGroup > 0){
            //     pushUndoQueue(PGroup);
            //     console.log("Just pushed :"+PGroup+" to UndoQueue");
            // }
            // if(PGroup > 1){
            //     pushUndoQueue(PGroup);
            //     console.log("Path pushed to undo queue of path size: "+PGroup);
            // }
            // setPGroup(0);
            if(nextTouch){
                start(nextTouch, nextTouchID);
            }
        }
    },[penInUse, touchID, start, move])

    const enterMouse = useCallback((event) => {
        if(event.which === 0){
            end(getsCoordinates(event), 'mouse')
        }
    }, [start])

    const startTouch = useCallback((event) => {
        event.preventDefault();
        let thisTouch = event.changedTouches[0];
        start(getTouchCoords(thisTouch), thisTouch.identifier);
    }, [start]);

    const moveTouch = useCallback((event) => {
        event.preventDefault();
        for(let activeTouch of event.changedTouches){
            move(getTouchCoords(activeTouch), activeTouch.identifier);
        }
    }, [move]);

    const endTouch = useCallback((event) => {
        event.preventDefault();
        for(let endingTouch of event.changedTouches) {
            if(event.targetTouches.length !== 0){
                end(getTouchCoords(endingTouch),
                    endingTouch.identifier,
                    getTouchCoords(event.targetTouches[0]),
                    event.targetTouches[0].identifier);
            } else {
                end(getTouchCoords(endingTouch), endingTouch.identifier);
            }
        }
    }, [end]);

    const startMouse = useCallback((event) => {
        start(getsCoordinates(event), 'mouse')
    }, [start]);

    const moveMouse = useCallback((event) => {
        move(getsCoordinates(event), 'mouse')
    },[move]);

    const endMouse = useCallback((event) => {
        end(getsCoordinates(event), 'mouse');
    }, [end]);

    //useEffect for startMouse
    useEffect(() => {
        if (!svgRef.current) {
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
        const canvas = two.renderer.domElement;

        canvas.addEventListener('mousedown', startMouse);
        canvas.addEventListener('touchstart', startTouch);
        return () => {
            canvas.removeEventListener('touchstart', startTouch);
            canvas.removeEventListener('mousedown', startMouse);
        };
    }, [startMouse, startTouch, two, toolInUse]);

    //useEffect for moveMouse
    useEffect(() => {
        if (!svgRef.current) {
            //console.log("moveMouse Ev. Handle notGood")
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
        const canvas = two.renderer.domElement;
        canvas.addEventListener('mousemove', moveMouse);
        canvas.addEventListener('touchmove', moveTouch);
        return () => {
            canvas.removeEventListener('touchmove', moveTouch);
            canvas.removeEventListener('mousemove', moveMouse);
        };
    }, [moveMouse, moveTouch, two, toolInUse]);

    //useEffect for endMouse
    useEffect(() => {
        if (!svgRef.current) {
            //console.log("MouseUp or MouseLeave Ev. Handle notGood")
            //console.log("SVG Status: "+(svgRef.current != null));
            //console.log("two load status: "+isLoaded);
            return;
        }
        const canvas = two.renderer.domElement;

        canvas.addEventListener('mouseup', endMouse);
        //canvas.addEventListener('mouseleave', endMouse);
        canvas.addEventListener('mouseenter', enterMouse);

        canvas.addEventListener('touchend', endTouch);
        return () => {
            canvas.removeEventListener('touchend', endTouch);
            //canvas.removeEventListener('mouseleave', endMouse);
            canvas.removeEventListener('mouseup', endMouse);
            canvas.removeEventListener('mouseenter', enterMouse);
        };
    }, [endTouch, touchID, endMouse, two, toolInUse]);

    //Gets the coordinates of the mouse event
    const getsCoordinates = (event) => {
        if (!svgRef.current) {
            return;
        }

        //Coordinate notes:
        // Don't use canvas or svgRef.current (which would normally make sense)
        // because canvas is modded via Two and doesn't work and
        // svgRef.current is just an empty component that I stick the two SVG onto

        return [event.pageX,  event.pageY]
    };

    const getTouchCoords = (touch) => {
        if (!svgRef.current) {
            return;
        }
        return [touch.pageX, touch.pageY]
    }

    // const drawLine = (originalMousePosition,  newMouse) => {
    //     if (!svgRef.current ) {
    //         //console.log("drawLine failed")
    //         //console.log("SVG Status: "+(svgRef.current != null));
    //         return;
    //     }
    //     console.log("Children before "+penType+": "+(two?two.scene.children.length:0));
    //     const m1 = makePoint(originalMousePosition);
    //     const m2 = makePoint(newMouse);
    //
    //
    //
    //     //Every new shape's gotta be recorded
    //     setPGroup(PGroup+(1+LINE_RES));
    //
    //
    //     if(penType === PEN_TYPES[0]) {
    //         const path = two.makeCurve([m1, m2], true);
    //         path.fill = color;
    //         path.stroke = color;
    //         path.curved = true;
    //         path.linewidth = radius;
    //     } else if(penType === PEN_TYPES[2]){
    //         const sPath = two.makeLine([m1, m2], true);
    //         sPath.fill = color;
    //         sPath.stroke = color;
    //         sPath.curved = false;
    //         sPath.linewidth = radius;
    //     }
    //     if(penType !== PEN_TYPES[2]) {
    //         setTwo(fillLine(two, originalMousePosition, newMouse, color, radius/2));
    //     }
    //
    //     //document.querySelector('#two-'+path.id);
    //
    //     two.update();
    //     setTwo(two);
    //     console.log("Children after "+penType+": "+(two?two.scene.children.length:0));
    //
    // }

    return (
        <div style={{overflow :"hidden" , height:'100vh', width:'100vw'}} >
            <div ref={svgRef} style={{"overflow":"hidden"}}>
            </div>
        </div>
    )
}
export default TwoCanvas;

// //Currently not being used, but ***VERY*** fun
// function getRandomColor() {
//     return 'rgb('
//         + Math.floor(Math.random() * 255) + ','
//         + Math.floor(Math.random() * 255) + ','
//         + Math.floor(Math.random() * 255) + ')';
// }

// const mouseUpCallback = useCallback( (event) => {
//
//
//     //NOTE: In current implementation, it is the tool callback switches (mouseUpCallback,
//     // mouseDownCallback, etc) that exit out of other tools, not the actual toolbar.
//     mouseEnd()
//     switch(toolInUse){
//         case "pen":
//             //mouseEnd();
//             break;
//         //Note: if stickers ever get online, this is where they should be thrown into
//         // the callback functions
//         case "circle":
//             setInUse(true)
//             dropShape(event);
//             break;
//         case "rectangle":
//             setInUse(true)
//             dropShape(event);
//             break;
//     }
// }, [inUse, toolInUse]);
