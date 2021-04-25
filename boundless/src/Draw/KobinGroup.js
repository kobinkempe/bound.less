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

const inLineZone = (y1Zone, y2Zone) => {
    return (y1Zone <= 1 || y2Zone <= 1);
}

const lineInZone = (x1Zone, x2Zone) => {
    return (x1Zone <= 1 && x2Zone >= 2) || (x2Zone <= 1 && x1Zone >= 2);
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
    if(mRectangleLine.length === 0){
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
    let subPath = path;
    if(path.curved){
        subPath = path.subdivide();
    }
    let vertices = subPath.vertices;

    let lastPoint = calculatePoint(vertices[0].x, vertices[0].y, subPath, isShape);
    let [lastXZone, lastYZone] = getZones(lastPoint, strokeRect, screenRect);
    let thisPoint;
    let thisXZone, thisYZone;
    for(let i = 1; i < vertices.length; i++){
        thisPoint = calculatePoint(vertices[i].x, vertices[i].y, subPath, isShape);
        [thisXZone, thisYZone] = getZones(thisPoint, strokeRect, screenRect);
        if(screenBetween(thisXZone, lastXZone) && screenBetween(thisYZone, lastYZone)){
            [fillPoints, fillLine] = addToRectangle(lastPoint, thisPoint, screenRect, fillPoints, fillLine);
            [strokePoints, strokeLine] = addToRectangle(lastPoint, thisPoint, strokeRect, strokePoints, strokeLine);
        } else if(strokeBetween(thisXZone, lastXZone) && strokeBetween(thisYZone, lastYZone)){
            [strokePoints, strokeLine] = addToRectangle(lastPoint, thisPoint, strokeRect, strokePoints, strokeLine);
        }
        if(inLineZone(thisYZone, lastYZone) && lineInZone(thisXZone, lastXZone)){
            if(findIntersectionY(lastPoint[0], screenRect.left, thisPoint[0], lastPoint[1],
                thisPoint[1], -1, screenRect.top, true)[1]){
                originInShape = !originInShape;
            }
        }
        lastPoint = thisPoint;
        [lastXZone, lastYZone] = [thisXZone, thisYZone];
    }
    thisPoint = calculatePoint(vertices[0].x, vertices[0].y, subPath, isShape);
    [thisXZone, thisYZone] = getZones(thisPoint, strokeRect, screenRect);
    if(screenBetween(thisXZone, lastXZone) && screenBetween(thisYZone, lastYZone)){
        [fillPoints, fillLine] = addToRectangle(lastPoint, thisPoint, screenRect, fillPoints, fillLine);
    }
    if(inLineZone(thisYZone, lastYZone) && lineInZone(thisXZone, lastXZone)){
        if(findIntersectionY(lastPoint[0], screenRect.left, thisPoint[0], lastPoint[1],
            thisPoint[1], -1, screenRect.top, true)[1]){
            originInShape = !originInShape;
        }
    }

    if(fillLine.length !== 0){
        fillPoints.push(fillLine);
    }
    if(strokeLine.length !== 0){
        strokePoints.push(strokeLine);
    }
    return [fillPoints, strokePoints, originInShape];
}

// Checks if any two line segments intersect
// Uses Cramer's Method, I don't know what this does but I did consult
// a math nerd who understands all this
let segIntersect = (seg1, seg2) => {
    // seg1 made up of [(x1, y1), (x2, y2)]
    // seg1 made up of [(x1, y1), (x2, y2)]
    let x1 = seg1[0][0];
    let y1 = seg1[0][1];
    let x2 = seg1[1][0];
    let y2 = seg1[1][1];

    let x3 = seg2[0][0];
    let y3 = seg2[0][1];
    let x4 = seg2[1][0];
    let y4 = seg2[1][1];

    // The z component of a cross product... I consulted Kaleb about the math involved
    let c1 = ((x2 - x1) * (y3 - y1)) - ((y2 - y1) * (x3 - x1));
    let c2 = ((x2 - x1) * (y4 - y1)) - ((y2 - y1) * (x4 - x1));

    if (Math.sign(c1) === Math.sign(c2)) {
        return [[0, 0], false]
    }

    // D, s, t is part of Cramer's method...
    // s and t solves for any part of the line segment that is the same
    let D = ((x4 - x3) * (y2 - y1)) - ((y4 - y3) * (x2 - x1));

    if (D === 0) {
        return [[0, 0], false];
    }
    let s = (((x4 - x3) * (y3 - y1)) - ((x3 - x1) * (y4 - y3))) / D;
    let t = ((x2 - x1) * (y3 - y1) - ((x3 - x1) * (y2 - y1))) / D;

    if (s > 0 && s < 1 && t > 0 && t < 1 && D !== 0) {
        return [[(x1 + (x2 - x1)) * t, (y1 + (y2 - y1)) * t], true];
    }

    return [[0, 0], false];
}
let swapLines = (line1, line2, idx1, idx2) => {
    let loopCount = Math.min(line1.length - idx1, line2.length - idx2);
    let i;
    for (i = 0; i < loopCount; ++i) {
        [line1[idx1 + i], line2[idx2 + i]] = [line2[idx2 + i], line1[idx1 + i]];
    }

    if (idx1 + i < line1.length) {
        line2 = line2.concat(line1.slice(idx1 + i));
        line1.splice(idx2 + i, line1.length - idx2 - i);
    } else if (idx2 + i < line2.length) {
        line1 = line1.concat(line2.slice(idx2 + i));
        line2.splice(idx2 + i, line2.length - idx2 - i);
    }
};
let lineIntersect = (line1, line2) => {
    let retVal = false;
    for (let i = 0; i < line1.length - 1; ++i) {
        for (let j = 0; j < line2.length - 1 && i < line1.length - 1; ++j) {
            let interPt;
            if (line1[i][0] === line2[j][0] && line1[i][1] === line2[j][1]) {
                //Checks that they actually crossed, not just touched
                let crossed = false;
                for(let k = 0; k < line2.length - 1 && !crossed && i > 0; ++k){
                    interPt = segIntersect([line1[i-1], line1[i + 1]], [line2[k], line2[k + 1]]);
                    if(interPt[1]){
                        crossed = true;
                        retVal = true;
                        swapLines(line1, line2, i+1, j+1);
                        [i, j] = [j, i];
                    }
                }
                for(let k = 0; k < line1.length - 1 && !crossed && j > 0; ++k){
                    interPt = segIntersect([line1[k], line1[k + 1]], [line2[j - 1], line2[j + 1]]);
                    if(interPt[1]){
                        crossed = true;
                        retVal = true;
                        swapLines(line1, line2, i+1, j+1);
                        [i, j] = [j, i];
                    }
                }
            } else {
                interPt = segIntersect([line1[i], line1[i + 1]], [line2[j], line2[j + 1]]);
                // return from segIntersect is ((x, y), t/f)
                if (interPt[1]) {
                    retVal = true;
                    line1.splice(i + 1, 0, interPt[0]);
                    line2.splice(j + 1, 0, interPt[0]);
                    ++i;
                    ++j;
                    swapLines(line1, line2, i + 1, j + 1);
                    [i, j] = [j, i];
                }
            }
        }
    }
    return retVal;
}
let untangleLines = (lines) => {
    for(let i = 0; i < lines.length; ++i){
        for(let j = i+1; j < lines.length; ++j){
            if(lineIntersect(lines[i], lines[j])){
                untangleLines(lines);
                return;
            }
        }
    }
}

const getFillShapes = (points, originInShape, rect, color) => {
    let retVal = [];
    let intersections = [];
    let shapes = [];
    let newPoints = points;
    if(points.length === 0){
        if(!originInShape){
            return retVal;
        } else {
            shapes = [getRectPath(rect)];
        }
    } else {
        untangleLines(newPoints);
    }
    let findNextIntersection = ([xCur, yCur], removePoint = false) => {
        let isTop = yCur === rect.top,
            isRight = xCur === rect.right,
            isBottom = yCur === rect.bottom,
            isLeft = xCur === rect.left;
        let currentVal = 0;
        let currentIndex = -1;
        for(let i = 0; i < intersections.length; ++i){
            let[[x, y], [j, n]] = intersections[i];
            if(x !== rect.top && x !== rect.bottom && y !== rect.left && y !== rect.right){
                let dTop = Math.abs(x - rect.top), dBottom = Math.abs(x - rect.bottom),
                    dLeft = Math.abs(x - rect.left), dRight = Math.abs(x - rect.right);
                if(dTop <= dBottom && dTop <= dLeft && dTop <= dRight){
                    intersections[i][0][0] = rect.top;
                    y = rect.top;
                } else if(dBottom <= dLeft && dBottom <= dRight){
                    intersections[i][0][0] = rect.bottom;
                    y = rect.bottom;
                } else if(dLeft <= dRight){
                    intersections[i][0][1] = rect.left;
                    x = rect.left;
                } else {
                    intersections[i][0][1] = rect.right;
                    x = rect.right;
                }
                if(n){
                    newPoints[j] = [intersections[i][0]].concat(newPoints[j]);
                } else{
                    newPoints[j].push(intersections[i][0])
                }
            }
            let diff = 0;
            if(isLeft && !isTop){
                if(x === rect.left){
                    diff = yCur - y;
                }
            } else if(isBottom){
                if(y === rect.bottom){
                    diff = xCur - x;
                }
            } else if(isRight){
                if(x === rect.right){
                    diff = y - yCur;
                }
            } else { //isTop
                if(y === rect.top){
                    diff = x - xCur;
                }
            }
            if(diff > 0 && (currentVal === 0 || diff < currentVal)){
                currentIndex = i;
                currentVal = diff;
            }
        }
        if(currentIndex === -1){
            if(isLeft && !isTop){
                return [[rect.left, rect.top], -1];
            } else if(isBottom){
                return [[rect.left, rect.bottom], -1];
            } else if(isRight){
                return [[rect.right, rect.bottom], -1];
            } else { //isTop
                return [[rect.right, rect.top], -1];
            }
        } else {
            let ret = intersections[currentIndex];
            if(removePoint){
                intersections.splice(currentIndex, 1);
            }
            return(ret);
        }
    }
    let addRestOfShape = (startPoint, [currentPoint, lineVal], hasPoints = true) => {
        if(startPoint[0]===currentPoint[0] && startPoint[1]===currentPoint[1] && hasPoints){
            return [currentPoint];
        } else {
            if(lineVal === -1){
                return [currentPoint].concat(
                    addRestOfShape(startPoint, findNextIntersection(currentPoint, true)));
            } else {
                let [lineI, isStartOfLine] = lineVal;
                let thisLine = newPoints[lineI];
                if(!isStartOfLine){
                    thisLine.reverse();
                }
                let endOfLine = thisLine[thisLine.length - 1];
                intersections.splice(intersections.findIndex(
                    inter => inter[0][0] === endOfLine[0] && inter[0][1] === endOfLine[1]),1)
                return thisLine.concat(addRestOfShape(startPoint, findNextIntersection(endOfLine, true)))
            }
        }
    }
    let makeShape = (point) => {
        return addRestOfShape(point[0], point, false);
    }
    if(points.length !== 0){
        let p0 = newPoints[0][0];
        let pn = newPoints[0][newPoints[0].length - 1];
        if(p0[0] === pn[0] || p0[1] === pn[1]){
            shapes = newPoints;
        } else {
            for(let i = 0; i < newPoints.length; ++i){
                intersections.push([newPoints[i][0], [i, true]]);
                intersections.push([newPoints[i][newPoints[i].length - 1], [i, false]]);
            }
            //Combines the starting -> ending point
            let done = false;
            for(let i = 0; i < intersections.length && !done; ++i){
                for(let j = i + 1; j < intersections.length && !done; ++j){
                    if(intersections[i][0][0] === intersections[j][0][0] &&
                        intersections[i][0][1] === intersections[j][0][1]){
                        if(intersections[i][1][1]){
                            let lineI = intersections[j][1][0];
                            newPoints[intersections[i][1][0]].shift();
                            newPoints[lineI] =
                                newPoints[lineI].concat(newPoints[intersections[i][1][0]]);
                            let endOfLine =
                                newPoints[lineI][newPoints[lineI].length - 1];
                            let changeIndex = intersections.findIndex(
                                inter => inter[0][0] === endOfLine[0] && inter[0][1] === endOfLine[1]);
                            intersections[changeIndex][1][0] = lineI;
                        } else {
                            let lineI = intersections[i][1][0];
                            newPoints[intersections[j][1][0]].shift();
                            newPoints[lineI] =
                                newPoints[lineI].concat(newPoints[intersections[j][1][0]]);
                            let endOfLine =
                                newPoints[lineI][newPoints[lineI].length - 1];
                            let changeIndex = intersections.findIndex(
                                inter => inter[0][0] === endOfLine[0] && inter[0][1] === endOfLine[1]);
                            intersections[changeIndex][1][0] = lineI;
                        }
                        intersections.splice(j, 1);
                        intersections.splice(i, 1);
                    }
                }
            }
            let point = [[rect.left, rect.top], -1];
            if(!originInShape){
                do{point = findNextIntersection(point[0], false)} while(point[1] === -1)
            }
            while(intersections.length !== 0){
                do{point = findNextIntersection(point[0], false)} while(point[1] === -1)
                shapes.push(makeShape(point));
                if(intersections.length !== 0){
                    do{point = findNextIntersection(point[0], false)} while(point[1] === -1)
                }
            }
        }
    }
    for(let line of shapes){
        let vertices = [];
        for(let i = 0; i < line.length; i++){
            vertices.push(new Two.Anchor(line[i][0]*10, line[i][1]*10))
        }
        let path = new Two.Path(vertices);
        path.noStroke();
        path.fill = color;
        path.curved = false;
        retVal.push(path);
    }
    return retVal;
}

const getRectPath = (rect) => {
    return[[rect.left, rect.top],
        [rect.right, rect.top],
        [rect.right, rect.bottom],
        [rect.left, rect.bottom]]
}

const addLine = (line, [x1, y1], [x2, y2], h) => {
    let newLine = line;
    let retLine = [];
    let l = line[line.length-1][0]
    let rect = {left: 0, right: l, top: 0, bottom: h}
    let isValid = (x, y) => {
        return x >= 0 && x <= l && y >= 0;
    }
    let midPos = ([mx1, my1], [mx2, my2], mx) => {
        if(mx2 === mx1){
            return my1;
        } else {
            let m = (my2 - my1)/(mx2 - mx1)
            return ((mx - mx1)*m) + my1
        }
    }
    //Note: p1x <= p2x, p3x <= p4x, p1->p2 is segment 1, p3->p4 is segment 2
    let findInterX = ([p1x, p1y], [p2x, p2y], [p3x, p3y], [p4x, p4y]) => {
        let m12, m34;

        //If either line is vertical, checks if they intersect and returns the intersection
        let isVert1 = p1x === p2x;
        if(p3x === p4x){ //If line 2 is vertical...
            if(isVert1){
                return [0, false];
            } else {
                let interY = midPos([p1x, p1y],[p2x, p2y], p3x)
                return [p3x, interY >= p3y && interY <= p4y];
            }
        } else if(isVert1){
            let interY = midPos([p3x, p3y],[p4x, p4y], p1x)
            return [p1x, interY >= p1y && interY <= p2y];
        }

        //If neither line is vertical
        m12 = (p2y - p1y)/(p2x - p1x);
        m34 = (p4y - p3y)/(p4x - p3x);
        if(m12 === m34){
            return[0, false];
        } else {
            let newX = (p3y - p1y + (m12*p1x) - (m34*p3x))/(m12 - m34);
            return [newX, newX >= p1x && newX >= p3x && newX <= p2x && newX <= p4x];
        }
    }
    let nx1, ny1, nx2, ny2;
    if(x1 <= x2){
        [nx1, ny1] = [x1, y1];
        [nx2, ny2] = [x2, y2];
    } else {
        [nx1, ny1] = [x2, y2];
        [nx2, ny2] = [x1, y1];
    }

    if(nx1 === nx2){
        return [newLine, true];
    }
    //Gets the part of the line segment that is within the border
    if(!isValid(nx1, ny1)){
        let valid = false;
        if(nx2 > 0 && nx1 < 0){
            let leftY = midPos([nx1, ny1], [nx2, ny2], 0)
            if(leftY >= 0){
                [nx1, ny1] = [0, leftY];
                valid = true;
            }
        }
        if(!valid){
            let topX = findInterX([nx1, ny1], [nx2, ny2], [0,0], [l, 0])
            if(topX[1]){
                [nx1, ny1] = [topX[0], 0];
                valid = true;
            }
        }
        if(!valid){
            return [line, false];
        }
    }
    if(!isValid(nx2, ny2)){
        let valid = false;
        if(nx2 > l && nx1 < l){
            let rightY = midPos([nx1, ny1], [nx2, ny2], l)
            if(rightY >= 0){
                [nx2, ny2] = [l, rightY];
                valid = true;
            }
        }
        if(!valid){
            let topX = findInterX([nx1, ny1], [nx2, ny2], [0,0], [l, 0])
            if(topX[1]){
                [nx2, ny2] = [topX[0], 0];
                valid = true;
            }
        }
        if(!valid){
            return [line, false];
        }
    }
    if(ny1 > h || ny2 > h){
        let inter3 = findInterX([nx1, ny1], [nx2, ny2], [0,h], [l, h])
        if(!inter3[1]){
            return addLine(line, [nx1, h], [nx2, h], h)
        } else {
            if (ny1 > h) {
                let point = nx1;
                [nx1, ny1] = [inter3[0], h];
                newLine = addLine(line, [point, h], [nx1, h], h)[0];
            } else {
                let point = nx2;
                [nx2, ny2] = [inter3[0], h];
                newLine = addLine(line, [nx2, h], [point, h],  h)[0];
            }
        }
    }
    if(nx1 === nx2){
        return [newLine, true];
    }

    let arrayOfEverything = [];
    arrayOfEverything.push(newLine[0]);
    if(nx1 === 0){
        arrayOfEverything.push([nx1, ny1]);
    }
    for(let i = 1; i < newLine.length; ++i){
        if(newLine[i-1][0] < nx1 && newLine[i][0] >= nx1){
            let interY = midPos(newLine[i-1], newLine[i], nx1)
            if(ny1 > interY){
                arrayOfEverything.push([nx1, interY]);
                arrayOfEverything.push([nx1, ny1]);
            }
        }
        let [interX, interValid] = findInterX([nx1, ny1], [nx2, ny2], newLine[i-1], newLine[i]);
        if(interValid){
            arrayOfEverything.push([interX, midPos([nx1, ny1], [nx2, ny2], interX)]);
        }
        if(newLine[i-1][0] <= nx2 && newLine[i][0] > nx2){
            let interY = midPos(newLine[i-1], newLine[i], nx2)
            if(ny2 > interY){
                arrayOfEverything.push([nx2, ny2]);
                arrayOfEverything.push([nx2, interY]);
            }
        }
        if(newLine[i][0] < nx1 || newLine[i][0] > nx2){
            arrayOfEverything.push(newLine[i]);
        } else {
            let lineY = midPos([nx1, ny1], [nx2, ny2], newLine[i][0]);
            if(newLine[i][1] > lineY){
                arrayOfEverything.push(newLine[i]);
            } else {
                arrayOfEverything.push([newLine[i][0], lineY]);
                if(i === newLine.length-1){
                    arrayOfEverything.push(newLine[i]);
                }
            }
        }
    }

    if(arrayOfEverything.length === 2){
        return arrayOfEverything;
    }

    // This bit pushes everything to retLine, but only if it is a meaningful point, i.e. not the
    // same as the point right after it, and a different slopes on either side of the point.
    retLine.push(arrayOfEverything[0]);
    let wasVertical = arrayOfEverything[0][0] === arrayOfEverything[1][0];
    let lastSlope = 0;
    if(!wasVertical){
        lastSlope =
            (arrayOfEverything[1][1]-arrayOfEverything[0][1])/(arrayOfEverything[1][0] - arrayOfEverything[0][0])
    }
    for(let i = 2; i < arrayOfEverything.length; ++i){
        if(arrayOfEverything[i][0] === arrayOfEverything[i-1][0]){ //Same X
            if((arrayOfEverything[i][1] !== arrayOfEverything[i-1][1]) && //Not Same Point
                !wasVertical){ //Not both vertical
                retLine.push(arrayOfEverything[i-1]);
                wasVertical = true;
            }
        } else { //Different X's (not vertical)
            let newSlope = (arrayOfEverything[i][1] - arrayOfEverything[i-1][1]) / (arrayOfEverything[i][0] -
                arrayOfEverything[i-1][0]);
            if(wasVertical || lastSlope !== newSlope){ //Different slopes
                retLine.push(arrayOfEverything[i-1]);
                lastSlope = newSlope;
                wasVertical = false;
            }
        }
    }
    retLine.push(arrayOfEverything[arrayOfEverything.length - 1]);

    return [retLine, true];
}

const SEMICIRCLE_SIDES = 25;
const SIN_CONST = Math.sin(Math.PI/SEMICIRCLE_SIDES);
const COS_CONST = Math.cos(Math.PI/SEMICIRCLE_SIDES);
const addCircle = (line, origin, startPoint, h, highDef, goRight = false) => {
    let sinConst = SIN_CONST, cosConst = COS_CONST;
    if(highDef){
        sinConst = Math.sin(Math.PI/(SEMICIRCLE_SIDES * 3));
        cosConst = Math.cos(Math.PI/(SEMICIRCLE_SIDES * 3));
    }
    let retLine = line;
    let wasInScreen = false, isInScreen = false;
    let [tx, ty] = startPoint;
    let i = 0;
    while((!wasInScreen || isInScreen) && i < SEMICIRCLE_SIDES){
        let dx = goRight? origin[0] - tx : tx - origin[0];
        let dy = ty - origin[1];
        let dtx = dx + dy*sinConst - dx*cosConst;
        let dty = dx*sinConst + dy*cosConst - dy;
        let newTx = goRight? tx + dtx: tx - dtx;
        wasInScreen = isInScreen;
        [retLine, isInScreen] = addLine(retLine, [tx, ty], [newTx, ty + dty], h);
        [tx, ty] = [newTx, ty + dty];
        ++i;
    }
    return retLine;
}

const getParallelLine = ([x1, y1], [x2, y2], lineWidth) => {
    let dx, dy;
    if(x1 === x2 && y1 === y2){
        return false;
    }
    let len = Math.sqrt(((x2 - x1)*(x2 - x1)) + ((y2 - y1)*(y2 - y1)));
    dx = (y1 - y2)*lineWidth/len;
    dy = Math.sqrt((lineWidth*lineWidth) - (dx * dx))
    return [[x1+dx, y1+dy], [x2+dx, y2+dy]]
}

const extendLine = (line, [x1, y1], [x2, y2], lineWidth, h, hD = false) => {
    let retLine = line;
    let nx1, ny1, nx2, ny2;
    if(x1 < x2){
        [nx1, ny1, nx2, ny2] = [x1, y1, x2, y2];
    } else {
        [nx1, ny1, nx2, ny2] = [x2, y2, x1, y1];
    }
    let parallelLine = getParallelLine([nx1, ny1], [nx2, ny2], lineWidth);
    if(parallelLine){
        retLine = addLine(retLine, parallelLine[0], parallelLine[1], h)[0];
        retLine = addCircle(retLine, [nx1, ny1], parallelLine[0], h, hD);
        retLine = addCircle(retLine, [nx2, ny2], parallelLine[1], h, hD, true);
    }
    return retLine;
}

const makePathBorder = (points, screenRect, lineWidth, rounded=true) => {
    let width = screenRect.right - screenRect.left,
        height = screenRect.bottom - screenRect.top;
    let topLine = [[0,0],[width, 0]],
        bottomLine = [[0,0],[width, 0]],
        leftLine = [[0,0],[height, 0]],
        rightLine = [[0,0],[height, 0]];
    let flipLine = (line, h) => {
        let retLine = line;
        let start = 0, end = retLine.length;
        if(line[0][0] === line[1][0]){
            start = 1;
        }
        if(retLine[end - 2][0] === retLine[end - 1][0]){
            --end;
        }
        let trimmedLine = retLine.slice(start, end);
        let newLine = [];
        if(trimmedLine[0][1] !== h){
            newLine.push([0, 0]);
        }
        for(let i = 0; i < trimmedLine.length; ++i){
            newLine.push([trimmedLine[i][0], h - trimmedLine[i][1]]);
        }
        if(newLine[newLine.length - 1][1] !== 0){
            newLine.push([newLine[newLine.length - 1][0], 0]);
        }
        return newLine;
    }

    for(let linePoints of points){
        let [xZone1, yZone1] = getZonesOne(linePoints[0], screenRect);
        if(xZone1 === 1 && yZone1 === 1){
            return getRectPath(screenRect);
        }
        for(let i = 1; i < linePoints.length; i++){
            let hDCircle = i === 1 || i === linePoints.length - 1;
            let [xZone2, yZone2] = getZonesOne(linePoints[i], screenRect);
            if((xZone2 === 1 && yZone2 === 1) ||
                (xZone2 === 1 && xZone1 === 2 && yZone1 !== yZone2) ||
                (yZone2 === 1 && yZone1 === 2 && xZone1 !== xZone2)){
                return getRectPath(screenRect);
            } else if(yZone2 === 0 && yZone1 === 0){
                let newPoint0 = [linePoints[i-1][0] - screenRect.left, linePoints[i-1][1] - screenRect.top];
                let newPoint1 = [linePoints[i][0] - screenRect.left, linePoints[i][1] - screenRect.top];
                topLine = extendLine(topLine, newPoint0, newPoint1, lineWidth, height, hDCircle);
            } else if(yZone2 === 2 && yZone2 === 2){
                let newPoint0 = [linePoints[i-1][0] - screenRect.left, screenRect.bottom - linePoints[i-1][1]];
                let newPoint1 = [linePoints[i][0] - screenRect.left, screenRect.bottom - linePoints[i][1]];
                bottomLine = extendLine(bottomLine, newPoint0, newPoint1, lineWidth, height, hDCircle);
            } else if(xZone2 === 0 && xZone1 === 0){
                let newPoint0 = [linePoints[i-1][1] - screenRect.top, linePoints[i-1][0] - screenRect.left];
                let newPoint1 = [linePoints[i][1] - screenRect.top, linePoints[i][0] - screenRect.left];
                leftLine = extendLine(leftLine, newPoint0, newPoint1, lineWidth, width, hDCircle);
            } else if(xZone2 === 2 && xZone1 === 2){
                let newPoint0 = [linePoints[i-1][1] - screenRect.top, screenRect.right - linePoints[i-1][0]];
                let newPoint1 = [linePoints[i][1] - screenRect.top, screenRect.right - linePoints[i][0]];
                rightLine = extendLine(rightLine, newPoint0, newPoint1, lineWidth, width, hDCircle);
            } else if(yZone2 !== 2 && yZone1 !== 2){
                let newPoint0 = [linePoints[i-1][0] - screenRect.left, linePoints[i-1][1] - screenRect.top];
                let newPoint1 = [linePoints[i][0] - screenRect.left, linePoints[i][1] - screenRect.top];
                topLine = extendLine(topLine, newPoint0, newPoint1, lineWidth, height, hDCircle);
            } else if(yZone2 !== 0 && yZone1 !== 0){
                let newPoint0 = [linePoints[i-1][0] - screenRect.left, screenRect.bottom - linePoints[i-1][1]];
                let newPoint1 = [linePoints[i][0] - screenRect.left, screenRect.bottom - linePoints[i][1]];
                bottomLine = extendLine(bottomLine, newPoint0, newPoint1, lineWidth, height, hDCircle);
            } else if(xZone2 !== 2 && xZone1 !== 2){
                let newPoint0 = [linePoints[i-1][1] - screenRect.top, linePoints[i-1][0] - screenRect.left];
                let newPoint1 = [linePoints[i][1] - screenRect.top, linePoints[i][0] - screenRect.left];
                leftLine = extendLine(leftLine, newPoint0, newPoint1, lineWidth, width, hDCircle);
            } else if(xZone2 !== 0 && xZone1 !== 0){
                let newPoint0 = [linePoints[i-1][1] - screenRect.top, screenRect.right - linePoints[i-1][0]];
                let newPoint1 = [linePoints[i][1] - screenRect.top, screenRect.right - linePoints[i][0]];
                rightLine = extendLine(rightLine, newPoint0, newPoint1, lineWidth, width, hDCircle);
            }
            [xZone1, yZone1] = [xZone2, yZone2];
        }
    }

    // topLine = flipLine(topLine, height);
    // for(let i = 1; i < bottomLine.length; ++i){
    //     topLine = addLine(topLine, bottomLine[i - 1], bottomLine[i], height)[0];
    // }
    // topLine = flipLine(topLine, height);
    // leftLine = flipLine(leftLine, width);
    // for(let i = 1; i < rightLine.length; ++i){
    //     leftLine = addLine(leftLine, rightLine[i - 1], rightLine[i], width)[0];
    // }
    // leftLine = flipLine(leftLine, width);

    let realTop = [[screenRect.right, screenRect.top]];
    for(let i = 0; i<topLine.length; ++i){
        realTop.push([topLine[i][0] + screenRect.left, topLine[i][1] + screenRect.top]);
    }
    let realBottom = [[screenRect.right, screenRect.bottom]];
    for(let i = 0; i<bottomLine.length; ++i){
        realBottom.push([bottomLine[i][0] + screenRect.left, screenRect.bottom - bottomLine[i][1]]);
    }
    let realLeft = [[screenRect.left, screenRect.bottom]];
    for(let i = 0; i<leftLine.length; ++i){
        realLeft.push([leftLine[i][1] + screenRect.left, leftLine[i][0] + screenRect.top]);
    }
    let realRight = [[screenRect.right, screenRect.bottom]];
    for(let i = 0; i<rightLine.length; ++i){
        realRight.push([screenRect.right - rightLine[i][1], rightLine[i][0] + screenRect.top]);
    }
    return [realLeft, realRight, realTop, realBottom];
}

const getStrokeShapes = (points, lineWidth, screenRect, color) => {
    let retVal = [];
    if(Math.pow(lineWidth, 2) > Math.pow(screenRect.right - screenRect.left, 2) +
        Math.pow(screenRect.bottom - screenRect.top, 2)){
        let newShapes = makePathBorder(points, screenRect, lineWidth);
        for(let shape of newShapes){
            let vertices = [];
            for(let i = 0; i < shape.length; i++){
                vertices.push(new Two.Anchor(shape[i][0]*10, shape[i][1]*10))
            }
            let path = new Two.Path(vertices);
            path.noStroke();
            path.fill = color;
            path.curved = false;
            retVal.push(path);
        }
        return retVal;
    } else {
        for(let line of points){
            let vertices = [];
            for(let i = 0; i < line.length; i++){
                vertices.push(new Two.Anchor(line[i][0]*10, line[i][1]*10))
            }
            let path = new Two.Path(vertices);
            path.noFill();
            path.stroke = color;
            path.curved = false;
            path.linewidth = lineWidth * 20;
            path.cap = 'round';
            path.join = 'round';
            retVal.push(path);
        }
    }
    return retVal;
}

function makeKobinizedShapes(item, screenRect){
    let retVal = [];
    let path, fillShapes, strokeShapes, opacity;
    let isShape, isFilled, isStroked;
    let length = 1;
    if(item.children){
        //This is for shapes, which is actually a group with a path in it
        length = item.children.length;
        isShape = true;
    } else {
        path = item;
        isShape = false;
    }
    for(let i = 0; i < length; ++i){
        if(isShape){
            path = item.children[i];
        }
        opacity = path.opacity*path.parent.opacity;
        if(path.vertices.length !== 0){
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
                fillShapes = getFillShapes(fillPoints, originInShape, screenRect, path.fill);
                if(fillShapes.length !== 0){
                    retVal = retVal.concat(fillShapes);
                }
            }
            if(isStroked){
                strokeShapes = getStrokeShapes(strokePoints, strokeSize, screenRect, path.stroke);
                if(strokeShapes.length !== 0){
                    retVal = retVal.concat(strokeShapes);
                }
            }
        }
    }

    if(retVal.length !== 0){
        let retGroup = new Two.Group();
        retGroup.add(retVal)
        retGroup.opacity = opacity;
        retVal = [retGroup];
    }

    return retVal;
}

// Pre: Group is a group full of paths and groups of paths, that is zoomed out past the window, which
// starts at (startX, startY), and is size width x height. It is important that it is still zoomed to the level desired
//
// Returns a kobinized set of paths that look the same as the given zoomed in group when the kobinized items are zoomed
// to a scale of .1 with no translation or rotation.
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
    // let unrulyChildren = [];
    // for(let i = 0; i < children.length; i++){
    //     if(overlaps(children[i].getBoundingClientRect(), windowRectangle, 90 * children[i].scale * group.scale)){
    //         unrulyChildren.push(children[i]);
    //     }
    // }
    for(let i = 0; i < children.length; i++){
        let newShapes = makeKobinizedShapes(children[i], windowRectangle);
        if(newShapes.length !== 0){
            retArray = retArray.concat(newShapes);
        }
    }
    return retArray;
}