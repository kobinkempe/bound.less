import Two from "two.js";
import {NEW_GROUP_SCALE_THRESHOLD, NEW_GROUP_TRANSLATE_THRESHOLD, ZOOM_IN_THRESHOLD} from "./TwoCanvas";
import KGroup from "./KGroup";

export default class LocalGroup{
    stale = false;
    twoRef;
    group;
    activeGroup = null;
    staleItems = [];
    kGroups = [];
    relativeGroups = [];
    static localGroups = [];
    static mainGroups = [];
    constructor(two = null) {
        this.group = new Two.Group();
        let scale = 1, translate = {x:0, y:0};
        if(LocalGroup.mainGroups.length !== 0){
            for (let mainGroup of LocalGroup.mainGroups){
                
            }
        }
        if(twoScale !== null && twoTranslate !== null){
            let factor = Math.round(Math.log2(twoScale)/(2*Math.log2(NEW_GROUP_SCALE_THRESHOLD)));
            scale = twoScale/Math.pow(NEW_GROUP_SCALE_THRESHOLD, 2*factor);
            factor = Math.round(twoTranslate.x/(2*NEW_GROUP_TRANSLATE_THRESHOLD));
            translate.x = twoTranslate.x - (2*factor*NEW_GROUP_TRANSLATE_THRESHOLD);
            factor = Math.round(twoTranslate.y/(2*NEW_GROUP_TRANSLATE_THRESHOLD));
            translate.y = twoTranslate.y - (2*factor*NEW_GROUP_TRANSLATE_THRESHOLD);
        }
        this.group.scale = scale;
        this.group.translation.x = translate.x;
        this.group.translation.y = translate.y;
        if (two !== null){
            two.add(this.group);
            this.twoRef = two;
        }
    }

    loadFromGroup = (group) => {
        this.group = group;
    }

    //TODO fix for undo and redo
    add = (item) => {
        this.group.add(item);
    }

    //TODO fix for undo and redo
    remove = (item) => {
        this.group.remove(item);
    }

    scale = () => {
        if(this.isStale()){
            return this.activeGroup.getParentScale();
        } else {
            return this.group.scale;
        }
    }

    translate = () => {
        if(this.isStale()){
            return this.activeGroup.getParentTranslate();
        } else {
            return {x:this.group.translation.x, y:this.group.translation.y};
        }
    }

    pan = (dx, dy) => {
        if(this.isStale()){
            if(!this.activeGroup.pan(dx, dy)){
                this.group.add(this.staleItems);
                let newX = this.translate().x + dx;
                let newY = this.translate().y + dy;
                this.activeGroup = null;
                this.stale = false;
                this.activateKGroup(this.scale(), {newX, newY})
            }
        } else {
            let newX = this.translate().x + dx;
            let newY = this.translate().y + dy;
            this.group.translation.x = newX;
            this.group.translation.y = newY;
        }
    }

    zoom = ({x, y}, amount) => {
        if(this.isStale()){
            if(this.activeGroup.zoom({x, y}, amount)){
                return;
            } else {
                this.stale = false;
                this.activeGroup = null;
                this.group.add(this.staleItems);
            }
        }
        let realAmount = Math.pow(2, amount);
        let realX = (x - this.translate().x)*(1 - realAmount) + this.translate().x;
        let realY = (y - this.translate().y)*(1 - realAmount) + this.translate().y;
        realAmount = this.scale() * realAmount;
        if(realAmount <= ZOOM_IN_THRESHOLD){
            this.group.scale = realAmount;
            this.group.translation.x = realX;
            this.group.translation.y = realY;
        } else {
            this.activateKGroup(realAmount,{x:realX, y:realY})
        }
    }

    // // Zooms and pans the group to the specified amount, including adjusting or switching KGroups as necessary
    // moveWindow = (scale, translate) => {
    //     if(this.isStale()){
    //         if(this.activeGroup.moveWindow(scale, translate)){
    //             return;
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
    //         this.activateKGroup(scale,{x:translate.x, y:translate.y})
    //     }
    // }

    activateKGroup = (zoom, {x, y}) => {
        this.group.children.forEach(
            (item) => {
                this.staleItems.push(item);
            }
        )
        this.stale = true;
        for (let kGroup of this.kGroups){
            if(this.activeGroup === null && kGroup.isInRange(zoom, {x, y})){
                kGroup.activate(zoom, {x, y});
                this.activeGroup = kGroup;
            }
        }
        if (this.activeGroup === null){
            let newKGroup = new KGroup(
                this.group, this.twoRef,
                window.outerWidth * 3,
                window.outerHeight * 3,
                0 - window.outerWidth,
                0 - window.outerHeight);
            this.kGroups.push(newKGroup);
            this.activeGroup = newKGroup;
        }
    }

    isDrawing = () => {
        return Math.abs(this.translate().x) <= NEW_GROUP_TRANSLATE_THRESHOLD
            && Math.abs(this.translate().y) <= NEW_GROUP_TRANSLATE_THRESHOLD
            && this.scale() >= (1/NEW_GROUP_SCALE_THRESHOLD)
            && this.scale() <= NEW_GROUP_SCALE_THRESHOLD
            && this.kGroups.length === 0
    }

    // isInRange = () => {
    //     let thisScale = this.scale();
    //     let thisTranslate = this.translate();
    //
    //     return (
    //         // 0 - thisTranslate.x >= this.startX * thisKScale
    //         // && 0 - thisTranslate.x + this.twoRef.width <= (this.startX + this.width) * thisKScale
    //         // && 0 - thisTranslate.y >= this.startY * thisKScale
    //         // && 0 - thisTranslate.y + this.twoRef.height <= (this.startX + this.width) * thisKScale
    //     );
    // }

    //Returns true if this group is currently displaying nothing
    isEmpty = () => {
        return this.group.children.length === 0;
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

    isStale = () => {
        return this.stale;
    }
}