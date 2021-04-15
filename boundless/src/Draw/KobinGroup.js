import Two from "two.js";


// Pre: Group is a group full of paths and groups of paths, that is zoomed out past the window, which
// starts at (startX, startY), and is size width x height. It is important that it is still zoomed to the level desired
//
// Returns a kobinized set of paths that look the same as the given zoomed in group when the kobinized items are zoomed
// to a scale of .1 with no translation or rotation.
export const kobinGroup = (group, width, height, startX=0, startY = 0) => {
    return [new Two.Ellipse(50, 50, 20, 20), new Two.Ellipse(150, 150, 25, 25)];
}