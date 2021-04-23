import Two from "two.js";

//rect1 and rect2 are two objects that have left, right, top, and bottom parameters. Returns true if they overlap
// the distance parameter is necessary because Two.getClientBoundingRectangle() doesn't know how to scale the path
// width, so we need to add it on manually. You can also use it to see if a rectangle is a certain distance from the
// other rectangle. So, if two rectangles are 10 apart and distance is 15, it will return true, even though they don't
// quite overlap
export const overlaps = (rect1, rect2, distance = 0) => {
    return ((rect1.left <= rect2.right + distance) &&
        (rect1.top <= rect2.bottom + distance) &&
        (rect1.right >= rect2.left - distance) &&
        (rect1.bottom >= rect2.top - distance))
}

const newVal = (x, scaleArray) => {
    let newX = x;
    for(let i = 0; i < scaleArray.length; i++){
        newX *= scaleArray[i][0];
        newX += scaleArray[i][1];
    }
    return newX;
}

const calculatePoint = (x, y, object, isShape) => {
    let xScaleArray = [[object.scale, object.translation.x], [object.parent.scale, object.parent.translation.x]]
    let yScaleArray = [[object.scale, object.translation.y], [object.parent.scale, object.parent.translation.y]]
    if(isShape){
        xScaleArray.push([object.parent.parent.scale, object.parent.parent.translation.x]);
        yScaleArray.push([object.parent.parent.scale, object.parent.parent.translation.y]);
    }
    return [newVal(x, xScaleArray), newVal(y, yScaleArray)];
}

// Zones are complicated, but they save a lot of calculations. I wouldn't recommend trying to understand
// the following 6 methods
const getZones = ([x, y], outerRect, innerRect) => {
    let xZone;
    if(x <= outerRect.left){
        xZone = 0;
    } else if(x <= innerRect.left){
        xZone = 1;
    } else if(x < innerRect.right){
        xZone = 2;
    } else if(x < outerRect.right){
        xZone = 3;
    } else {
        xZone = 4;
    }
    if(y < outerRect.top){
        return [xZone, 0];
    } else if(y < innerRect.top){
        return [xZone, 1];
    } else if(y <= innerRect.bottom){
        return [xZone, 2];
    } else if(y <= outerRect.bottom){
        return [xZone, 3];
    } else {
        return [xZone, 4];
    }
}

const getZonesOne = ([x, y], rect) => {
    let xZone;
    if(x <= rect.left){
        xZone = 0;
    } else if(x < rect.right){
        xZone = 1;
    } else {
        xZone = 2;
    }
    if(y < rect.top){
        return [xZone, 0];
    } else if(y <= rect.bottom){
        return [xZone, 1];
    } else {
        return [xZone, 2];
    }
}

const screenBetween = (x1Zone, x2Zone) => {
    return (x1Zone <= 2 && 2 <= x2Zone) || (x2Zone <= 2 && 2 <= x1Zone)
}

const strokeBetween = (x1Zone, x2Zone) => {
    return (x1Zone <= 3 && 1 <= x2Zone) || (x2Zone <= 3 && 1 <= x1Zone)
}

const inLineZone = (x1Zone, x2Zone) => {
    return (x1Zone <= 1 || x2Zone <= 1);
}

const lineInZone = (y1Zone, y2Zone) => {
    return (y1Zone <= 1 && y2Zone >= 2) || (y2Zone <= 1 && y1Zone >= 2);
}

const findIntersectionY = (startX, hitX, endX, startY, endY, minY, maxY, noMin = false) => {
    if(endX === startX){
        return [0, false];
    }
    let hitY = ((hitX - startX)*(endY - startY)/(endX - startX)) + startY;
    return [hitY, (hitY < maxY && (noMin || hitY >= minY))]
}

const findIntersectionX = (startY, hitY, endY, startX, endX, minX, maxX) => {
    let hitX = ((hitY - startY)*(endX - startX)/(endY - startY)) + startX;
    return [hitX, (hitX < maxX && hitX >= minX)]
}

const findIntersection = (point1, point2, rectangle, mayCrossLeft, mayCrossTop, mayCrossRight, mayCrossBottom) => {
    let minY = rectangle.top, maxY = rectangle.bottom;
    let interY, yValid;
    if(mayCrossLeft){
        [interY, yValid] = findIntersectionY(point1[0], rectangle.left, point2[0], point1[1], point2[1], minY, maxY);
        if(yValid){
            return [rectangle.left, interY]
        }
    } else if(mayCrossRight){
        [interY, yValid] = findIntersectionY(point1[0], rectangle.right, point2[0], point1[1], point2[1], minY, maxY);
        if(yValid){
            return [rectangle.right, interY]
        }
    }

    let minX = rectangle.left, maxX = rectangle.right;
    let interX, xValid;
    if(mayCrossTop){
        [interX, xValid] = findIntersectionX(point1[1], rectangle.top, point2[1], point1[0], point2[0], minX, maxX);
        if(xValid){
            return [interX, rectangle.top]
        }
    } else if(mayCrossBottom){
        [interX, xValid] = findIntersectionX(point1[1], rectangle.bottom, point2[1], point1[0], point2[0], minX, maxX);
        if(xValid){
            return [interX, rectangle.bottom]
        }
    }

    return false;
}

const addToRectangle = (lastPoint, thisPoint, rectangle, rectanglePoints, rectangleLine) => {
    let mRectanglePoints = rectanglePoints;
    let mRectangleLine = rectangleLine;
    let newLastPoint = lastPoint;
    let newThisPoint = thisPoint;
    let lastZones1 = getZonesOne(lastPoint, rectangle);
    let mayCrossLeft = lastZones1[0] === 0,
        mayCrossTop = lastZones1[1] === 0,
        mayCrossRight = lastZones1[0] === 2,
        mayCrossBottom = lastZones1[1] === 2,
        inRect = (lastZones1[0] === 1 && lastZones1[1] === 1);
    if(mRectangleLine === []){
        if(!inRect){
            let intersection = findIntersection(lastPoint, thisPoint, rectangle, mayCrossLeft,
                mayCrossTop, mayCrossRight, mayCrossBottom);
            if(intersection){
                newLastPoint = intersection;
            } else {
                return [mRectanglePoints, mRectangleLine];
            }
        }
        mRectangleLine.push(newLastPoint);
    }
    let thisZones1 = getZonesOne(thisPoint, rectangle);
    mayCrossLeft = thisZones1[0] === 0
    mayCrossTop = thisZones1[1] === 0
    mayCrossRight = thisZones1[0] === 2
    mayCrossBottom = thisZones1[1] === 2
    inRect = (thisZones1[0] === 1 && thisZones1[1] === 1);
    if(!inRect){
        let intersection = findIntersection(lastPoint, thisPoint, rectangle, mayCrossLeft,
            mayCrossTop, mayCrossRight, mayCrossBottom);
        if(intersection){
            newThisPoint = intersection;
        } else {
            return [mRectanglePoints, mRectangleLine];
        }
    }
    mRectangleLine.push(newThisPoint);
    if(!inRect){
        mRectanglePoints.push(mRectangleLine);
        return [mRectanglePoints, []];
    }
    return [mRectanglePoints, mRectangleLine];
}

const makePath = (path, isShape, screenRect, strokeSize=0) => {
    let strokeRect = {
        left:screenRect.left - strokeSize,
        top:screenRect.top - strokeSize,
        right: screenRect.right + strokeSize,
        bottom:screenRect.bottom + strokeSize
    }
    let originInShape = false;
    let fillPoints = [];
    let strokePoints = [];
    let fillLine = [];
    let strokeLine = [];
    let subPath = path.subdivide();
    let vertices = subPath.vertices;

    let lastPoint = calculatePoint(vertices[0].x, vertices[0].y, path, isShape);
    let [lastXZone, lastYZone] = getZones(lastPoint, strokeRect, screenRect);
    let thisPoint;
    for(let i = 1; i < vertices.length; i++){
        thisPoint = calculatePoint(vertices[i].x, vertices[i].y, path, isShape);
        let [thisXZone, thisYZone] = getZones(thisPoint, strokeRect, screenRect);
        if(screenBetween(thisXZone, lastXZone) && screenBetween(thisYZone, lastYZone)){
            [fillPoints, fillLine] = addToRectangle(lastPoint, thisPoint, screenRect, fillPoints, fillLine);
            [strokePoints, strokeLine] = addToRectangle(lastPoint, thisPoint, strokeRect, strokePoints, strokeLine);
        } else if(strokeBetween(thisXZone, lastXZone) && strokeBetween(thisYZone, lastYZone)){
            [strokePoints, strokeLine] = addToRectangle(lastPoint, thisPoint, strokeRect, strokePoints, strokeLine);
        }
        if(inLineZone(thisXZone, lastXZone) && lineInZone(thisYZone, lastYZone)){
            if(findIntersectionY(lastPoint[0], screenRect.left, thisPoint[0], lastPoint[1],
                thisPoint[1], -1, screenRect.top, true)[1]){
                originInShape = !originInShape;
            }
        }
        lastPoint = thisPoint;
        [lastXZone, lastYZone] = [thisXZone, thisYZone];
    }
    if(fillLine !== []){
        fillPoints.push(fillLine);
    }
    if(strokeLine !== []){
        strokePoints.push(strokeLine);
    }
    return [fillPoints, strokePoints, originInShape];
}

const getFillShape = (points, originInShape) => {
    let retVal = [];
    for(let line of points){
        let vertices = [];
        for(let i = 0; i < line.length; i++){
            vertices.push(new Two.Anchor(line[i][0]*10, line[i][1]*10))
        }
        let path = new Two.Path(vertices);
        path.noFill();
        path.stroke = 'red';
        path.curved = true;
        path.linewidth = 5;
        path.cap = 'round';
        path.join = 'round';
        retVal.push(path);
    }
    return retVal;
}

const getStrokeShape = (points, lineWidth) => {
    let retVal = [];
    for(let line of points){
        let vertices = [];
        for(let i = 0; i < line.length; i++){
            vertices.push(new Two.Anchor(line[i][0]*10, line[i][1]*10))
        }
        let path = new Two.Path(vertices);
        path.noFill();
        path.stroke = 'black';
        path.curved = true;
        path.linewidth = lineWidth * 20;
        path.cap = 'round';
        path.join = 'round';
        retVal.push(path);
    }
    return retVal;
}

function makeKobinizedShape(item, screenRect){
    let retVal = [];
    let path, fillShape, strokeShape;
    let isShape, isFilled, isStroked;
    if(item.children){
        //This is for shapes, which is actually a group with a path in it
        path = item.children[0];
        isShape = true;
    } else {
        path = item;
        isShape = false;
    }
    isFilled = (path.fill !== "transparent") && (path.fill !== undefined);
    isStroked = (path.stroke !== "transparent") && (path.stroke !== undefined);

    let strokeSize = path.linewidth*path.scale*path.parent.scale/2;
    if(isShape){
        strokeSize *= path.parent.parent.scale;
    }
    if(!strokeSize){
        strokeSize = 0;
    }

    let [fillPoints, strokePoints, originInShape] = makePath(path, isShape, screenRect, strokeSize);
    if(isFilled){
        fillShape = getFillShape(fillPoints, originInShape);
        if(fillShape !== []){
            retVal = retVal.concat(fillShape);
        }
    }
    if(isStroked){
        strokeShape = getStrokeShape(strokePoints, strokeSize);
        if(strokeShape !== []){
            retVal = retVal.concat(strokeShape);
        }
    }

    return retVal;
}

// Pre: Group is a group full of paths and groups of paths, that is zoomed out past the window, which
// starts at (startX, startY), and is size width x height. It is important that it is still zoomed to the level desired
//
// Returns a kobinized set of paths that look the same as the given zoomed in group when the kobinized items are zoomed
// to a scale of .1 with no translation or rotation.

/**
 *
 * @param group - Group of paths that need to be kobinized
 * @param width - width of the boundingRect of the new kCut
 * @param height -
 * @param startX - top-left coordinate
 * @param startY -
 * @returns {[Two.Ellipse, Two.Ellipse]}
 */
export const kobinGroup = (group, width, height, startX=0, startY = 0) => {
    const windowRectangle = {
        top: startY,
        left: startX,
        bottom: startY + height,
        right: startX + width
    };
    let retArray = [];
    let children = group.children;
    //These are the children we might have to worry about
    let unrulyChildren = [];
    for(let i = 0; i < children.length; i++){
        if(overlaps(children[i].getBoundingClientRect(), windowRectangle, 90 * children[i].scale * group.scale)){
            unrulyChildren.push(children[i]);
        }
    }
    for(let i = 0; i < unrulyChildren.length; i++){
        retArray = retArray.concat(makeKobinizedShape(unrulyChildren[i], windowRectangle));
    }
    return retArray;
}


//Creates parts of paths -NR

