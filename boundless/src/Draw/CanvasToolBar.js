import {ClickAwayListener, Fab, Toolbar} from "@material-ui/core";
import {
    BorderColorRounded,
    Close,
    DeleteForever,
    Height,
    Palette,
    Undo,
    Apps,
    Gesture,
    Create, Remove, Extension, RadioButtonUnchecked, CheckBoxOutlineBlank, StarBorder,
    TextFields
} from "@material-ui/icons";
import LogoSmallIcon from "../Images/toolbarIcons/logoSmall";
import {HexColorPicker} from "react-colorful";
import "../Stylesheets/CanvasToolBar.css";
import WidthSlider from "./Toolbar/WidthSlider";
import {useState} from "react";
import {useHistory} from "react-router-dom";
import ToolButton from "../Components/toolButton"
import {PEN_TYPES} from "../Pages/CanvasPage";

export default function CanvasToolbar({setToolSelected,
                                      selectColor,
                                      setSelectColor,
                                      setWipe,
                                      lineWidth,
                                      setLineWidth,
                                      setUndoState,
                                      penType,
                                      setPenType}){
    //Toolbar States
    const [toolDisplay, setToolDisplay] = useState('closed');
    const [optionDisplay, setOptionDisplay] = useState('none');

    const history = useHistory();

    let logoIcon =
        <Fab className={'logoTool'}
             onClick={()=>{
                 history.push('/');
             }}>
            <LogoSmallIcon/>
        </Fab>;

    let getTransform = (tool=0, option=0) => {
        let moveX = 65*option;
        let moveY = 65*tool;
        return "translate3d(" + moveX + "px," + moveY + "px,0)"
    }

    //The different popups being used in the toolbar
    let colorPicker =
        <ClickAwayListener onClickAway={()=>{setOptionDisplay('none')}}>
            <div className='colorPickerWrapperC' style={{transform: getTransform(5, 1)}}>
                <HexColorPicker className={"small"}
                                color={selectColor}
                                onChange={setSelectColor}
                />
            </div>
        </ClickAwayListener>

    let heightSlider =
        <ClickAwayListener onClickAway={()=>{setOptionDisplay('none')}}>
            <div className={'hSlider'} style={{transform: getTransform(6, 1)}}>
                <WidthSlider onClick={setLineWidth} lineWidth={lineWidth}/>
            </div>
        </ClickAwayListener>


    return(
        [
            logoIcon,
            <div className={'toolBarTools'}>
                <ToolButton toolDisplay={toolDisplay}
                            //Close/Apps button
                            onClick={()=>{
                                if(toolDisplay==='open'){
                                    setToolDisplay('closed')
                                } else {
                                    setToolDisplay('open')
                                }
                            }}
                            toolNum={0}
                            icon={(toolDisplay==='open')?<Close/>:<Apps/>}/>
                <ToolButton toolDisplay={toolDisplay}
                            //Undo
                            onClick={()=>{
                                setUndoState(true);
                            }}
                            toolNum={1}
                            icon={<Undo/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            //Pen
                            optionDisplay={optionDisplay === 'pen'}
                            onClick={()=>{
                                setPenType(PEN_TYPES[0]);
                                setOptionDisplay('none');
                                setToolSelected('pen');
                            }}
                            toolNum={2}
                            option={1}
                            icon={<BorderColorRounded/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            //
                            optionDisplay={optionDisplay === 'pen'}
                            onClick={()=>{
                                setPenType(PEN_TYPES[1]);
                                setOptionDisplay('none');
                                setToolSelected('pen');
                            }}
                            toolNum={2}
                            option={2}
                            icon={<Create/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'pen'}
                            onClick={()=>{
                                setPenType(PEN_TYPES[2]);
                                setOptionDisplay('none');
                                setToolSelected('pen');
                            }}
                            toolNum={2}
                            option={3}
                            icon={<Remove/>}
                />

                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                if(optionDisplay === 'pen'){
                                    setOptionDisplay('none');
                                } else {
                                    setOptionDisplay('pen');
                                }
                            }}
                            toolNum={2}
                            icon={<Gesture/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay=== 'text'}
                            onClick={()=> {
                                setOptionDisplay('none');
                                setToolSelected('text');
                            }}
                            toolNum={3}
                            icon={<TextFields/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'shapes'}
                            onClick={()=>{
                                setOptionDisplay('none');
                                setToolSelected('circle');
                            }}
                            toolNum={4}
                            option={1}
                            icon={<RadioButtonUnchecked/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'shapes'}
                            onClick={()=>{
                                setOptionDisplay('none');
                                setToolSelected('rectangle');
                            }}
                            toolNum={4}
                            option={2}
                            icon={<CheckBoxOutlineBlank/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'shapes'}
                            onClick={()=>{
                                setOptionDisplay('none');
                                setToolSelected('star');
                            }}
                            toolNum={4}
                            option={3}
                            icon={<StarBorder/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                if(optionDisplay === 'shapes'){
                                    setOptionDisplay('none');
                                } else {
                                    setOptionDisplay('shapes');
                                }
                            }}
                            toolNum={4}
                            icon={<Extension/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                if(optionDisplay === 'palette'){
                                    setOptionDisplay('none')
                                } else {
                                    setOptionDisplay('palette')
                                }
                            }}
                            toolNum={5}
                            icon={<Palette/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={() => {
                                if(optionDisplay === 'sizePicker'){
                                    setOptionDisplay('none')
                                } else {
                                    setOptionDisplay('sizePicker')
                                }
                            }}
                            toolNum={6}
                            icon={<Height/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                setWipe(true);
                            }}
                            toolNum={7}
                            icon={<DeleteForever/>}
                />
                {(optionDisplay === 'palette')? colorPicker:null}
                {(optionDisplay === 'sizePicker')? heightSlider:null}
            </div>
        ]
    )
}
