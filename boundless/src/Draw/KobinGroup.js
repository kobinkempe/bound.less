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
        // ||
        // ((rect1.left >= rect2.left) && (rect1.left <= rect2.right)
        // || (rect1.top >= rect2.top) && (rect1.top <= rect2.bottom)
        // || (rect1.right >= rect2.left) && (rect1.right <= rect2.right)
        // || (rect1.bottom >= rect2.top) && (rect1.bottom <= rect2.bottom))
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
<<<<<<< Updated upstream
    let windowRectangle = {
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
            retArray.push(children[i]);
        }
    }
    return retArray;
}
=======
    return [new Two.Ellipse(50, 50, 20, 20), new Two.Ellipse(150, 150, 25, 25)];
}

//Creates parts of paths -NR

>>>>>>> Stashed changes
