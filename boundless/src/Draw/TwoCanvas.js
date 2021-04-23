import React, {useCallback, useEffect, useRef, useState} from "react";
import {useDispatch} from "react-redux";

//I get by with a little help(er) from my friends
import {makePoint, useTwo} from "./TwoHelpers";
import {PEN_TYPES} from "../Pages/CanvasPage";
import {kobinGroup, overlaps} from "./KobinGroup";
import {printRect} from "./logHelpers";
import firebase from "firebase";
import Two from "two.js";

const NEW_GROUP_SCALE_THRESHOLD = 10;
const NEW_GROUP_TRANSLATE_THRESHOLD = 1000;

const ZGROUP_OVERLAP = 10;


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
                       penType=PEN_TYPES[1],
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

    //console.log("Twocanvas: " + canvasID + " ," + isNew);

    //Creates the 'two' object w/o mounting it to the actual DOM
    //const [two, setTwo] = useTwo({canvasID, isNew});
    const [two, setTwo] = useState(new Two({width: window.outerWidth, height: window.outerHeight, autostart:true, resolution:40}));

    let s = new XMLSerializer();
    let storageRef = firebase.storage().ref();
    let canvasPath;

    const CANV_NAME = "1";
    if(firebase.auth().currentUser) {
        canvasPath = "/" + firebase.auth().currentUser.displayName + "/" + "canvas_" + CANV_NAME + ".svg";
    } else {
        canvasPath = "/public/" + "canvas_" + CANV_NAME + ".svg";
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
    const [undidTwoStack, setUndidTwoStack] = useState([]);

    //Redo Queue
    const [redoStack, setRedoStack] = useState([]);
    const [lastItem, setLastItem] = useState(0);

    //ZUI checker
    const [zui, setZUI] = useState(null);

    const [curIndex, setCurIndex] = useState(-2);
    const [group, setGroup] = useState([null]);
    const [staleGroup, setStaleGroup] = useState([null]);


    const [scale, setScale] = useState([1]);
    const [translate, setTranslate] = useState([[0,0]]);

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

    const downloadSVG = async (canvasRef) => {
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

    const load = async (two, url) => {
        await two.load(url, ((svg) => {
            console.log("In load function")
            console.log(svg);
            svg.center();
            svg.translation.set(two.width / 2, two.height / 2);
            two.add(svg);
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


    // //Load ZUI
    // useEffect(() => {
    //     if(!svgRef.current || !two){
    //         return;
    //     }
    //     console.log("Loaded ZUI");
    //     setZUI(new ZUI(two.scene).addLimits(.06,8));
    // }, [])

    //Wipe Tool
    // useEffect(()=>{
    //     if(!svgRef.current){
    //         return
    //     }
    //
    //     if(wipe){
    //         let items = [];
    //         // I really don't know about this here. I might be copying pointers to things that are soon to be
    //         // potentially deleted, idk how javascript works
    //         for(let item of two.scene.children){
    //             items.push(item);
    //         }
    //         if(items !== []){
    //             setUndidTwoStack([items].concat(undidTwoStack));
    //             two.clear();
    //             two.update();
    //             setTwo(two);
    //         }
    //         setWipe(false);
    //     }
    // }, [two, wipe, undidTwoStack])

    // Example KobinGroup Use
    useEffect(()=>{
        if(!svgRef.current){
            return
        }

        if(wipe){
            let newItems = kobinGroup(group[0], two.width, two.height)
            group[0].remove(group[0].children);
            group[0].add(newItems);
            group[0].scale = .1;
            group[0].translation.x = 0;
            group[0].translation.y = 0;
            setGroup([])
            setScale([1])
            setTranslate([[0,0]]);
            two.clear();
            setWipe(false);
        }
    }, [two, wipe, undidTwoStack, kobinGroup])

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

    const checkScale = (scale) => {
        return scale >= (1/NEW_GROUP_SCALE_THRESHOLD) &&
            scale <= NEW_GROUP_SCALE_THRESHOLD
    }

    const checkStale = useCallback((gIndex) =>{
        if(!group[gIndex]){
            return false;
        }



        if(gIndex>-1) {
            const r = group[gIndex].getBoundingClientRect();
            let twoV = {left: 0, right: two.width, bottom: two.height, top: 0};

            //Things not in the screen need to derender
            if (!overlaps(twoV, r, ZGROUP_OVERLAP)) {
                console.log("Group #" + gIndex + " just went stale. BRect: " + printRect(r));
                const gDom = document.getElementById(group[gIndex].id);

                let zipObj = {dom:"", translation: {x:0, y:0}, scale:1};


                zipObj.dom = JSON.stringify({html: gDom.innerHTML});
                zipObj.translation.x = group[gIndex].translation.x;
                zipObj.translation.y = group[gIndex].translation.y;
                zipObj.scale = group[gIndex].scale;

                if (gIndex >= staleGroup.length) {
                    staleGroup.push(zipObj)
                } else {
                    staleGroup[gIndex] = zipObj;
                }


                group[gIndex].remove(group[gIndex].children);
                setGroup(group);
                console.log("Emptied Group #" + gIndex + " to " + group[gIndex].children.length + " children");
                setStaleGroup(staleGroup);
                two.update();


                //Things overlapping in the screen should render
            } else{
                two.interpret(JSON.parse(staleGroup[gIndex].dom), true, true);
                staleGroup[gIndex].dom = '';
            }
            return true;

        } else {
            return false;
        }
    },[two, group, staleGroup])

    const checkTranslate = ([x, y]) => {
        return Math.abs(x) <= NEW_GROUP_TRANSLATE_THRESHOLD &&
            Math.abs(y) <= NEW_GROUP_TRANSLATE_THRESHOLD
    }

    const findGroup = useCallback(() => {
        for(let i = 0; i < group.length; i++){
            if(checkScale(scale[i]) && checkTranslate(translate[i])){
                return i;
            }
        }
        return -1;
    }, [scale, translate])

    const makeGroup = useCallback(() => {
        let newGroup = two.makeGroup();
        setGroup(group.concat(newGroup));
        let factor = Math.round(Math.log2(scale[0])/(2*Math.log2(NEW_GROUP_SCALE_THRESHOLD)));
        let newScale = scale[0]/Math.pow(NEW_GROUP_SCALE_THRESHOLD, 2*factor);
        setScale(scale.concat(newScale));
        factor = Math.round(translate[0][0]/(2*NEW_GROUP_TRANSLATE_THRESHOLD));
        let newX = translate[0][0]-(2*factor*NEW_GROUP_TRANSLATE_THRESHOLD);
        factor = Math.round(translate[0][1]/(2*NEW_GROUP_TRANSLATE_THRESHOLD));
        let newY = translate[0][1]-(2*factor*NEW_GROUP_TRANSLATE_THRESHOLD);
        setTranslate(translate.concat([[newX, newY]]));
        newGroup.scale = newScale;
        newGroup.translation.x = newX;
        newGroup.translation.y = newY;
        return [newGroup, newScale, [newX, newY]];
    }, [group, scale, translate])


    const panGroup = (index, [x,y], amount) => {
        let realX = (x - group[index].translation.x)*(1 - translate) + group[index].translation.x;
        let realY = (y - group[index].translation.y)*(1 - translate) + group[index].translation.y;
        group[index].translation.x = realX;
        group[index].translation.y = realY;
        let translates = translate;
        translate[index] = [realX, realY];
        setTranslate(translates);
        if(index === curIndex){
            if(!(checkTranslate([realX, realY]))){
                setCurIndex(-1);
            }
        }

    }

    const zoomGroup = (index, [x,y], amount) => {
        let realAmount = Math.pow(2, amount);
        let realX = (x - group[index].translation.x)*(1 - realAmount) + group[index].translation.x;
        let realY = (y - group[index].translation.y)*(1 - realAmount) + group[index].translation.y;
        realAmount = group[index].scale * realAmount;
        group[index].scale = realAmount;
        group[index].translation.x = realX;
        group[index].translation.y = realY;
        let scales = scale;
        scales[index] = realAmount;
        setScale(scales);
        let translates = translate;
        translate[index] = [realX, realY];
        setTranslate(translates);

        /**
        if(!checkStale(index)){
            console.log("Failed to load Group #"+index+ " into list of staleGroups");
        }
         **/

        if(index === curIndex){
            if(!(checkScale(realAmount) && checkTranslate([realX, realY]))){
                setCurIndex(-1);
            }
        }else{
        }
    }

    const zoomCallback = useCallback( (event) => {
        event.preventDefault();
        const dy = (-event.deltaY)/1000;
        for(let index = 0; index < group.length; index++){
            if(group[index] != null){
                zoomGroup(index, [event.pageX, event.pageY], dy)
            }
        }
        two.update();
        setTwo(two);
    },[group, zoomGroup, two])

    const panCallback = useCallback( (event ) => {
        event.preventDefault();
        }


    )

    const addInverseZoom = (item, scale, translate) => {
        let inverseScale = 1/scale;
        let inverseTranslate = [0-translate[0], 0-translate[1]];
        item.scale = inverseScale;
        item.translation.x = (inverseTranslate[0] * inverseScale);
        item.translation.y = (inverseTranslate[1] * inverseScale);
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
    }, [color, radius, toolInUse, two, group])

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
        let index = curIndex;
        let mGroup, mScale, mTranslate;

        // if we are in an existing group
        if(index === -1) {
            index = findGroup();
        }
        mGroup = group[index];
        mScale = scale[index];
        mTranslate = translate[index];

        // These are for creating a new group; -2 is for the first group
        if(index === -1){
            [mGroup, mScale, mTranslate] = makeGroup();
            index = group.length;
        } else if(index === -2){
            mGroup = two.makeGroup();
            setGroup([mGroup]);
            index = 0;
            mScale = scale[index];
            mTranslate = translate[index];
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
            mGroup.add(mPath);
            addInverseZoom(mPath, mScale, mTranslate);
            two.update();
            setTwo(two);
        } else if(isMouseDownOnlyTool()){
            let shape = two.makeGroup(dropShape(coords));
            mGroup.add(shape);
            addInverseZoom(shape, mScale, mTranslate);
            two.update();
            setTwo(two);
        } else if(toolInUse === 'pan'){

        }
    }, [toolInUse, penInUse, dropShape, two, setPenOptions, group, curIndex, makeGroup, findGroup])

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


