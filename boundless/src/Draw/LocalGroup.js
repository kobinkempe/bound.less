import Two from "two.js";
import {NEW_GROUP_SCALE_THRESHOLD, NEW_GROUP_TRANSLATE_THRESHOLD} from "./TwoCanvas";

export default class LocalGroup{
    kobinLevel = 0;
    group;
    static mainGroup;
    constructor(two = null, twoScale = null, twoTranslate = null) {
        this.group = new Two.Group();
        let scale = 1, translate = {x:0, y:0};
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
            if (LocalGroup.mainGroup === null){
                LocalGroup.mainGroup = this;
            }
        }
    }

    loadFromGroup = (group) => {
        this.group = group;
        if (LocalGroup.mainGroup === null){
            LocalGroup.mainGroup = this;
        }
    }

    isMain = () => {
        return LocalGroup.mainGroup === this;
    }

    add = (item) => {
        this.group.add(item);
    }

    remove = (item) => {
        this.group.remove(item);
    }

    scale = () => {
        return this.group.scale;
    }

    translate = () => {
        return {x:this.group.translation.x, y:this.group.translation.y}
    }

    pan = (dx, dy) => {
        let newX = this.translate().x + dx;
        let newY = this.translate().y + dy;
        this.group.translation.x = newX;
        this.group.translation.y = newY;
    }

    zoom = ({x, y}, amount) => {
        let realAmount = Math.pow(2, amount);
        let realX = (x - this.translate().x)*(1 - realAmount) + this.translate().x;
        let realY = (y - this.translate().y)*(1 - realAmount) + this.translate().y;
        realAmount = this.scale() * realAmount;
        this.group.scale = realAmount;
        this.group.translation.x = realX;
        this.group.translation.y = realY;
    }

    isInRange = () => {
        return Math.abs(this.translate().x) <= NEW_GROUP_TRANSLATE_THRESHOLD
            && Math.abs(this.translate().y) <= NEW_GROUP_TRANSLATE_THRESHOLD
            && this.scale() >= (1/NEW_GROUP_SCALE_THRESHOLD)
            && this.scale() <= NEW_GROUP_SCALE_THRESHOLD
    }

    isStale = () => {
        return this.kobinLevel !== 0;
    }
}