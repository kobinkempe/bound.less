import "../Stylesheets/CanvasToolBar.css"
import {Fab} from "@material-ui/core";


export default function toolButton({toolDisplay,
                                       optionDisplay=false,
                                       onClick,
                                       toolNum,
                                       option=false,
                                       icon,
                                       small=false}){

    let getTransform = (tool=0, option=0) => {
        let moveX = 65*option;
        let moveY = 65*tool;
        return "translate3d(" + moveX + "px," + moveY + "px,0)"
    }

    let toolStyle;
    if(toolNum === 0){
        toolStyle = 'tool1'
    } else if(small){
        toolStyle = 'toolSmall'
    } else {
        toolStyle = 'tool'
    }

    let o = option;
    if(!optionDisplay){
        o = 0;
    }

    return(
        <Fab className={toolStyle}
             style={(toolDisplay==='open')? {transform: getTransform(toolNum, o)}: {}}
             onClick={onClick}
             size={small?'small':'large'}
        >
            {icon}
        </Fab>
    )
}