import React, {useCallback, useEffect, useRef, useState} from "react";
import {useDispatch} from "react-redux";

//I get by with a little help(er) from my friends
import {makePoint, useTwo} from "./TwoHelpers";
import {PEN_TYPES} from "../Pages/CanvasPage";
import {kobinGroup, overlaps} from "./KobinGroup";
import {printRect} from "./logHelpers";
import firebase from "firebase";
import Two from "two.js";
import canvas from "two.js/src/renderers/canvas";
import LocalGroup from "./LocalGroup";

export const NEW_GROUP_SCALE_THRESHOLD = 10;
export const NEW_GROUP_TRANSLATE_THRESHOLD = 1000;
export const ZOOM_IN_THRESHOLD = 1000;


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
                       canvasID,
                       isNew
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


    //const dispatch = useDispatch();

    //Creates the 'two' object w/o mounting it to the actual DOM
    //const [two, setTwo] = useTwo({canvasID, isNew});
    //TODO create a window resize event for window.onResize
    const [two, setTwo] =
        useState(new Two({width: window.outerWidth, height: window.outerHeight, autostart:true, resolution:40}));

    let s = new XMLSerializer();
    let storageRef = firebase.storage().ref();
    let canvasPath;

    if(firebase.auth().currentUser) {
        canvasPath = "/" + firebase.auth().currentUser.displayName + "/" + "canvas_" + canvasID + ".svg";
    } else {
        canvasPath = "/public/" + "canvas_" + canvasID + ".svg";
    }

    //Keeps track of the # of shapes that need to be removed from two
    //const [PGroup, setPGroup] = useState(0);

    //Keeps track of the # of undos completed;
    // const [doneUndos, setdoneUndos] = useState(0);
    // const [undoQueue, pushUndoQueue, setUndoQueue] = useUndoQueue();

    //Determines whether TwoCanvas has been appended onto svgRef

    //Stores mouse coordinates
    const [penArray, setPenArray] = useState([]);
    const [path, setPath] = useState(null);

    //Boolean for if the mouse is currently down
    const [penInUse, setPenInUse] = useState(false);
    const [touchID, setTouchID] = useState(-1);

    //Undo storage when Clear is used
    const [undoStack, setUndoStack] = useState([]);

    //Redo Stack
    const [redoStack, setRedoStack] = useState([]);

    const [curIndex, setCurIndex] = useState(-2);
    const [localGroups, setLocalGroups] = useState([null]);

    const [mainScale, setMainScale] = useState(1);
    const [mainTranslate, setMainTranslate] = useState({x:0, y:0});

    const isMouseDownOnlyTool = useCallback(()=>{
            return (toolInUse === 'circle' || toolInUse === 'rectangle'|| toolInUse === 'text'|| toolInUse === 'star');
        },
        [toolInUse]
    );

    const addActionToUndo = (idx, item) => {
        // Adds [action, item] to the undo stack
        // Clears the redo stack
        undoStack.push([idx, item])
        setRedoStack([]);
    }

    const undoLastItem = useCallback(() => {
        if(undoStack.length < 1){
            return;
        }
        const last = undoStack.pop();
        localGroups[last[0]].remove(last[1]);
        two.update();
        redoStack.push(last);
        setUndoStack(undoStack);
        setRedoStack(redoStack);
        setTwo(two);
    }, [localGroups, undoStack, redoStack, two])

    const redoNextItem = useCallback(() => {
        if(redoStack.length !== 0){
            const last = redoStack.pop();
            localGroups[last[0]].add(last[1]);
            two.update();
            undoStack.push(last);
            setUndoStack(undoStack);
            setLocalGroups(localGroups);
            setRedoStack(redoStack);
            setTwo(two);
        }
    }, [localGroups, undoStack, redoStack, two]);

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

    const downloadSVG = async (canvasRef, userDownload) => {
        await canvasRef.getDownloadURL()
            .then(async (url) => {
                console.log(url);
                await load(two, url).then(() => {
                    two.update();
                    setTwo(two);
                    console.log("Reached this point");
                });
            }).then(() => {
                if (!svgRef.current) {
                    console.log("No svgRef.current")
                    return;
                }
                console.log(("Loaded Two"));
                setTwo(two.appendTo(svgRef.current));
        }).catch((error) => {
            switch (error.code) {
                case 'storage/object-not-found':
                    console.log("File does not exist");
                    console.log("Loaded Two");
                    setTwo(two.appendTo(svgRef.current));
                    break;
                case 'storage/unauthorized':
                    console.log("User doesn't have permission");
                    break;
                case 'storage/unknown':
                    console.log("Unknown error");
                    break;
            }
        });
    };

    const downloadSVGForUser = (canvasRef) => {
        canvasRef.getDownloadURL().then((url) => {
            let xhr = new XMLHttpRequest();
            xhr.responseType = 'text';
            xhr.onload = (event) => {
                let text = xhr.response;
            };
            xhr.open('GET', url);
            xhr.send();
        }).catch((error) => {
            console.error(error);
        })
    }

    const load = async (two, url) => {
        await two.load(url, ((svgGroup, svg) => {
            let children = svgGroup.children[0].children;
            let mGroups = [];
            for(let i = 0; i < children.length; ++i){
                let child = children[i];
                let items = [];
                let itemScales = [], itemTranslates = [];
                for(let j = 0; j < child.children.length; ++j){
                    let transformMatrix =
                        svg.children[1].children[i].children[j].transform.baseVal[0].matrix;
                    let ogTranslate = [transformMatrix.e, transformMatrix.f];
                    items.push(child.children[j]);
                    itemScales[j] = items[j].scale.x;
                    itemTranslates[j] = [items[j].translation.x, items[j].translation.y];
                    itemTranslates[j][0] =
                        itemTranslates[j][0] * itemScales[j] + (1-itemScales[j])*(ogTranslate[0]);
                    itemTranslates[j][1] =
                        itemTranslates[j][1] * itemScales[j] + (1-itemScales[j])*(ogTranslate[1]);
                }
                let newGroup = new Two.Group(items);
                for(let j = 0; j < items.length; ++j){
                    newGroup.add(items[j]);
                    [items[j].translation.x, items[j].translation.y] = itemTranslates[j];
                }
                let newScale = child.scale.x;
                let newTranslate = [child.translation.x, child.translation.y];
                newGroup.scale = newScale;
                newGroup.translation.x = newTranslate[0];
                newGroup.translation.y = newTranslate[1];
                two.scene.add(newGroup);
                let newLocalGroup = new LocalGroup();
                newLocalGroup.loadFromGroup(newGroup);
                mGroups.push(newLocalGroup);
            }
            setLocalGroups(mGroups);
            setCurIndex(-1);
        }))
        return 1;
    };

    //Appends twoCanvas and approves loading
    useEffect(() => {
        let storageRef = firebase.storage().ref();
        let canvasRef = storageRef.child(canvasPath);
        downloadSVG(canvasRef);

        /*if (!svgRef.current) {
            return;
        }
        console.log(("Loaded Two"));
        setTwo(two.appendTo(svgRef.current));*/
    }, []);

    //Saves canvas
    //TODO fix this
    useEffect(() => {
        const interval = setInterval(() => {

            let d = two.renderer.domElement;
            let str = s.serializeToString(d);

            //TODO: Test the code below after our demo (3/29)
            //let canvasRef = storageRef.child(firebase.auth().currentUser.displayName+"_1.svg");
            let canvasRef = storageRef.child(canvasPath);


            canvasRef.putString(str).then((snapshot) => {
                //console.log('Uploaded string');
            }).catch((error) => {
                switch (error.code) {
                    case 'storage/unauthorized':
                        console.log("You're not authorized");
                        break;
                    case 'storage/canceled':
                        console.log("User canceled upload");
                        break;
                    case 'storage/unknown':
                        console.log("Unknown error");
                        break;
                }
            })
            console.log('Image auto-saved on cloud');
        }, 10000);

        return () => clearInterval(interval);
    }, [two]);

    //Wipe Tool
    useEffect(()=>{
        if(!svgRef.current){
            return
        }

        if(wipe){
            two.clear();
            two.remove(two.scene);
            setLocalGroups([null]);
            setCurIndex(-2);
            setUndoStack([]);
            setRedoStack([]);
            two.update();
            setWipe(false);
        }
    }, [two, wipe, addActionToUndo])

    // Example KobinGroup Use
    // useEffect(()=>{
    //     if(!svgRef.current){
    //         return
    //     }
    //
    //     if(wipe){
    //         let newItems = kobinGroup(localGroups[0], two.width, two.height)
    //         localGroups[0].remove(localGroups[0].children);
    //         localGroups[0].add(newItems);
    //         localGroups[0].scale = .1;
    //         localGroups[0].translation.x = 0;
    //         localGroups[0].translation.y = 0;
    //         setLocalGroups([])
    //         setScale([1])
    //         setTranslate([[0,0]]);
    //         two.clear();
    //         setWipe(false);
    //     }
    // }, [two, wipe, undidTwoStack, kobinGroup])

    //Undo Tool
    useEffect(() =>{
        if(!svgRef.current){
            return
        }
        if(undo){
            undoLastItem();
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
    }, [undoLastItem, undo])

    //Redo Tool
    useEffect(() =>{
        if(!svgRef.current){
            return
        }

        if(redo){
            redoNextItem();
            setRedo(false);
        }
    }, [redo, redoNextItem])

    const zoomCallback = useCallback( (event) => {
        event.preventDefault();
        const dy = (-event.deltaY)/1000;
        for(let localGroup of localGroups){
            if(localGroup !== null){
                localGroup.zoom({x:event.pageX, y:event.pageY}, dy);
                if (localGroup.isMain()){
                    setMainScale(localGroup.scale());
                    setMainTranslate(localGroup.translate());
                }
            }
        }
        two.update();
        setTwo(two);
    },[localGroups, two])

    const addInverseZoom = (item, scale, translate) => {
        let inverseScale = 1/scale;
        let inverseTranslate = {x:0-translate.x, y:0-translate.y};
        item.scale = inverseScale;
        item.translation.x = (inverseTranslate.x * inverseScale);
        item.translation.y = (inverseTranslate.y * inverseScale);
    }

    const dropShape = useCallback((coord) => {
        if (coord) {
            if (toolInUse === 'circle') {
                const circ = two.makeCircle(coord[0], coord[1], radius / 2);
                circ.fill = color;
                circ.noStroke();
                return circ;
            } else if (toolInUse === 'rectangle') {
                const rect = two.makeRectangle(coord[0], coord[1], radius, radius);
                rect.fill = color;
                rect.noStroke();
                return rect;
                //dispatch(loadUndo( 1))
            } else if (toolInUse === 'star'){
                const star = two.makeStar(coord[0], coord[1], radius, radius*2/5, 5);
                star.fill = color;
                star.noStroke();
                star.rotation = Math.PI;
                return star;
            } else if (toolInUse === 'text'){

                // User clicks, types something, hits enter, and it shows up
                const text = two.makeText("Text", coord[0], coord[1]);
                text.size = radius * 2;

                two.renderer.domElement.addEventListener('keyup', function(e) {
                    let c = String.fromCharCode(e.which);
                    if (e.keyCode === 46) { // keyCode for delete
                        text.value = text.value.slice(0, text.value.length - 1);
                    } else {
                        text.value += c;
                    }
                }, false);
                return text;
            }

            //pushUndoQueue(1);
        }
    }, [color, radius, toolInUse, two, localGroups])

    const setPenOptions = useCallback((path)=>{
        path.noFill();
        path.stroke = color;
        path.curved = true;
        path.linewidth = radius;
        path.cap = 'round';
        path.join = 'round';
        switch (penType){
            case PEN_TYPES[0]:
                break;
            case PEN_TYPES[1]:
                path.opacity = .4;
                break;
            case PEN_TYPES[3]:
                path.stroke = 'white';
                path.linewidth = radius * 2;
                break;
            default:
                break;
        }

    }, [penType, color, radius])

    const start = useCallback((coords, thisTouchID) => {
        if(toolInUse === 'pan' && !penInUse){
            setPenArray(coords);
            setTouchID(thisTouchID);
            setPenInUse(true);
        } else if (toolInUse === 'download') {
            //TODO this will download when you click the canvas? that ain't right
            console.log("Two Canvas has registered download");
            let storageRef = firebase.storage().ref();
            let canvasRef = storageRef.child(canvasPath);
            downloadSVGForUser(canvasRef);
        } else {
            let index = curIndex;
            let localGroup;

            if(index >= 0 && !localGroups[index].isInRange()){
                index = -1;
            }
            localGroup = localGroups[index];

            // These are for creating a new localGroup; -2 is for the first localGroup
            if(index === -1){
                //TODO Why did we get rid of findGroup? Maybe see if we're in a group first
                localGroup = new LocalGroup(two, mainScale, mainTranslate);
                setLocalGroups(localGroups.concat(localGroup));
                index = localGroups.length;
            } else if(index === -2){
                localGroup = new LocalGroup(two);
                setLocalGroups([localGroup]);
                index = 0;
            }
            setCurIndex(index);

            if(toolInUse === 'pen' && !penInUse){
                const point = makePoint(coords);
                setPenArray([point]);
                setTouchID(thisTouchID);
                setPenInUse(true);
                const mPath = two.makeCurve([], true);
                setPenOptions(mPath);
                setPath(mPath);
                localGroup.add(mPath);
                addActionToUndo(index, mPath);
                addInverseZoom(mPath, localGroup.scale(), localGroup.translate());
                two.update();
                setTwo(two);
            } else if(isMouseDownOnlyTool()){
                let shape = two.makeGroup(dropShape(coords));
                localGroup.add(shape);
                addActionToUndo(index, shape);
                addInverseZoom(shape, localGroup.scale(), localGroup.translate());
                two.update();
                setTwo(two);
            }
        }
    }, [toolInUse, penInUse, dropShape, two, setPenOptions, localGroups, curIndex])

    const move = useCallback((coords, thisTouchID) => {
        if (penInUse && thisTouchID === touchID) {
            if (toolInUse === 'pen') {
                if (penType === PEN_TYPES[2]) {
                    setPenArray([penArray[0], makePoint(coords)]);
                } else {
                    setPenArray(penArray.concat(makePoint(coords)));
                }
                path.vertices = penArray;
                two.update();
                setTwo(two);
            } else if(toolInUse === 'pan') {
                let dx = coords[0] - penArray[0];
                let dy = coords[1] - penArray[1];
                for (let localGroup of localGroups) {
                    if (localGroup != null) {
                        localGroup.pan(dx, dy);
                        if (localGroup.isMain()){
                            setMainScale(localGroup.scale());
                            setMainTranslate(localGroup.translate());
                        }
                    }
                }

                setPenArray(coords);
                two.update();
                setTwo(two);
            }
        }
    }, [toolInUse, touchID, penInUse, penArray, path, two, penType, localGroups])

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

    //These include the event listeners and the methods that mount them to the two canvas
    {
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

        //useEffect for scrollMouse
        useEffect(() => {
            if (!svgRef.current) {
                //console.log("SVG Status: "+(svgRef.current != null));
                //console.log("two load status: "+isLoaded);
                return;
            }
            const canvas = two.renderer.domElement;

            canvas.addEventListener('wheel', zoomCallback);
            return () => {
                canvas.removeEventListener('wheel', zoomCallback);
            };
        }, [two, toolInUse, zoomCallback]);
    }

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


