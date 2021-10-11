import {kobinGroup} from "./KobinGroup";
import {ZOOM_IN_THRESHOLD} from "./TwoCanvas";

export default class KGroup {
    childGroups = [];
    // This kGroup's scale * scaleConst = previous group's scale
    scaleConst;
    // This kGroup's translate + translateConst = previous group's translate
    translateConst;

    //This is the group inherited from the parent for displaying the items
    group;

    items;
    stale = false;
    activeGroup = null;

    twoRef;

    width;
    height;
    startX;
    startY;

    constructor(group, twoRef,
                width = window.outerWidth,
                height = window.outerHeight,
                startX = 0,
                startY = 0,
                setInGroup = true) {
        this.items = kobinGroup(group, width, height, startX, startY);
        [this.group, this.width, this.height, this.startX, this.startY, this.twoRef] =
            [group, width, height, startX, startY, twoRef];
        if(setInGroup){
            this.group.remove(this.group.children);
            this.group.add(this.items);
        }
        this.scaleConst = group.scale * 10;
        this.translateConst = {x:group.translation.x, y:group.translation.y}
        this.group.scale = .1;
        this.group.translation.x = 0;
        this.group.translation.y = 0;
    }

    getParentScale = () => {
        return this.getScale() * this.scaleConst;
    }

    // Returns the scale that this kGroup is currently at, or the scale it would be at if the group it has
    // replaced were at the given scale if it is specified
    getScale = (parentScale = -1) => {
        if(parentScale !== -1){
            return parentScale / this.scaleConst;
        } else if(this.stale){
            return this.activeGroup.getParentScale();
        } else {
            return this.group.scale;
        }
    }

    // Returns the translation that this kGroup is currently at, or the translation it would be at if the group it has
    // replaced were at the given translate and scale if they are specified
    getTranslate = (parentTranslate = -1, parentScale) => {
        if (parentTranslate !== -1){
            return {
                x: parentTranslate.x - (parentScale * this.translateConst.x * 10 / this.scaleConst),
                y: parentTranslate.y - (parentScale * this.translateConst.y * 10 / this.scaleConst)
            }
        } else if(this.stale){
            return this.activeGroup.getParentTranslate();
        } else {
            return {x:this.group.translation.x, y:this.group.translation.y}
        }
    }

    getParentTranslate = () => {
        let thisTranslate = this.getTranslate();
        let thisScale = this.getScale();
        return {
            x:thisTranslate.x + this.translateConst.x * thisScale * 10,
            y:thisTranslate.y + this.translateConst.y * thisScale * 10
        };
    }

    isInRange = (scale = -1, translate = -1) => {
        let thisKScale = this.getScale(scale) * 10;
        let thisTranslate = this.getTranslate(translate, scale);

        return (
            0 - thisTranslate.x >= this.startX * thisKScale
            && 0 - thisTranslate.x + this.twoRef.width <= (this.startX + this.width) * thisKScale
            && 0 - thisTranslate.y >= this.startY * thisKScale
            && 0 - thisTranslate.y + this.twoRef.height <= (this.startX + this.width) * thisKScale
        );
    }

    isEmpty = () => {
        return this.group.children.length === 0;
    }

    isOverZoomed = (parentScale = -1) => {
        return this.getScale(parentScale) > ZOOM_IN_THRESHOLD;
    }

    // Assumes we are already in range
    activate = (parentZoom, {x, y}) => {
        let newScale = this.getScale(parentZoom);
        let newTranslate = this.getTranslate({x, y}, parentZoom);
        this.group.remove(this.group.children);
        this.group.add(this.items);
        if(this.isOverZoomed(parentZoom)){
            this.activateChild(newScale, newTranslate);
        } else {
            this.group.scale = newScale;
            this.group.translation.x = newTranslate.x;
            this.group.translation.y = newTranslate.y;
        }
    }

    // Returns true if one of the children is in range and can be activated, otherwise false
    activateChild = (zoom, {x, y}) => {
        this.stale = true;
        for (let childGroup of this.childGroups){
            if(childGroup.isInRange(zoom, {x, y})){
                childGroup.activate(zoom, {x, y});
                this.activeGroup = childGroup;
                return true;
            }
        }
        return false;
    }

    // Recursively finds and returns the actual KGroup or LocalGroup that is currently active
    // ie, if this has an active KGroup, but that KGroup has a KGroup of itself, it returns the KGroup's KGroup
    getActiveGroup = () => {
        if(this.activeGroup === null){
            return this;
        } else {
            return this.activeGroup.getActiveGroup();
        }
    }

    createChild = () => {
        if (this.activeGroup === null){
            // TODO this could cause a problem if things off screen are outside range of the kGroup... ideally
            //  check that we're not close to the edge then create a kGroup with some padding, or if we are create a
            //  regular one
            let newKGroup = new KGroup(
                this.group, this.twoRef,
                window.outerWidth * 3,
                window.outerHeight * 3,
                0 - window.outerWidth,
                0 - window.outerHeight);
            this.childGroups.push(newKGroup);
            this.activeGroup = newKGroup;
        }
    }

    //returns false if it goes out of range, sets the group to an empty group at the parents' zoom level
    zoom = ({x, y}, amount) => {
        if(this.stale){
            if(this.activeGroup.zoom({x, y}, amount)){
                return true;
            } else {
                this.stale = false;
                this.activeGroup = null;
                this.group.add(this.items);
            }
        }
        let realAmount = Math.pow(2, amount);
        let translate = this.getTranslate();
        let realX = (x - translate.x)*(1 - realAmount) + translate.x;
        let realY = (y - translate.y)*(1 - realAmount) + translate.y;
        realAmount = this.getScale() * realAmount;
        this.group.scale = realAmount;
        this.group.translation.x = realX;
        this.group.translation.y = realY;
        if(!this.isInRange()){
            this.returnToParent();
            return false;
        } else if(this.isOverZoomed()){
            if(!this.activateChild(realAmount,{x:realX, y:realY})) {
                this.createChild();
            }
        }
        return true;
    }

    // // Zooms and pans the group to the specified amount, including adjusting or switching KGroups as necessary
    // moveWindow = (scale, translate) => {
    //     if(this.stale){
    //         if(this.activeGroup.moveWindow(scale, translate)){
    //             return true;
    //         } else {
    //             this.stale = false;
    //             this.activeGroup = null;
    //             this.group.add(this.staleItems);
    //         }
    //     }
    //     if(scale <= ZOOM_IN_THRESHOLD){
    //         this.group.scale = scale;
    //         this.group.translation.x = translate.x;
    //         this.group.translation.y = translate.y;
    //     } else {
    //         if(!this.activateChild(scale,{x:translate.x, y:translate.y})) {
    //             this.createChild();
    //         }
    //     }
    //     return true;
    // }

    returnToParent = () => {
        let parentScale = this.getParentScale();
        let parentTranslate = this.getParentTranslate();
        this.group.remove(this.group.children);
        this.group.scale = parentScale;
        this.group.translation.x = parentTranslate.x;
        this.group.translation.y = parentTranslate.y;
    }

    //returns false if it goes out of range, sets the group to an empty group at the parents' zoom level
    pan = (dx, dy) => {
        if(this.stale){
            if(this.activeGroup.pan(dx, dy)){
                return true;
            } else {
                this.stale = false;
                this.activeGroup = null;
                this.group.add(this.items);
            }
        }

        let translate = this.getTranslate();
        let newX = translate.x + dx;
        let newY = translate.y + dy;
        this.group.translation.x = newX;
        this.group.translation.y = newY;

        if(!this.isInRange()){
            this.returnToParent();
            return false;
        } else if(this.isOverZoomed()){
            if(!this.activateChild(this.getScale(),{newX, newY})) {
                this.createChild();
            }
        }
        return true;
    }
}