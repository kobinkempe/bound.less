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
    DragIndicator, Remove, Extension, RadioButtonUnchecked, CheckBoxOutlineBlank, StarBorder,
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


    let cleanup = () => {
        setWipe(false);
        //setUndoState(false);

    }

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
            <div className='colorPickerWrapperC' style={{transform: getTransform(4, 1)}}>
                <HexColorPicker className={"small"}
                                color={selectColor}
                                onChange={setSelectColor}
                />
            </div>
        </ClickAwayListener>

    let heightSlider =
        <ClickAwayListener onClickAway={()=>{setOptionDisplay('none')}}>
            <div className={'hSlider'} style={{transform: getTransform(5, 1)}}>
                <WidthSlider onClick={setLineWidth} lineWidth={lineWidth}/>
            </div>
        </ClickAwayListener>


    return(
        [
            logoIcon,
            <div className={'toolBarTools'}>
                <ToolButton toolDisplay={toolDisplay}
                            //Undo/Apps button
                            onClick={()=>{
                                if(toolDisplay==='open'){
                                    cleanup();
                                    setUndoState();
                                    //setUndoState(true);
                                } else {
                                    setToolDisplay('open')
                                }
                            }}
                            toolNum={0}
                            icon={(toolDisplay==='open')?<Undo/>:<Apps/>}/>
                <ToolButton toolDisplay={toolDisplay}
                            //Pen
                            optionDisplay={optionDisplay === 'pen'}
                            onClick={()=>{
                                setPenType(PEN_TYPES[0]);
                                setOptionDisplay('none');
                                setToolSelected('pen');
                            }}
                            toolNum={1}
                            option={1}
                            icon={<Gesture/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            //
                            optionDisplay={optionDisplay === 'pen'}
                            onClick={()=>{
                                setPenType(PEN_TYPES[1]);
                                setOptionDisplay('none');
                                setToolSelected('pen');
                            }}
                            toolNum={1}
                            option={2}
                            icon={<DragIndicator/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'pen'}
                            onClick={()=>{
                                setPenType(PEN_TYPES[2]);
                                setOptionDisplay('none');
                                setToolSelected('pen');
                            }}
                            toolNum={1}
                            option={3}
                            icon={<Remove/>}
                />

                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                cleanup();
                                if(optionDisplay === 'pen'){
                                    setOptionDisplay('none');
                                } else {
                                    setOptionDisplay('pen');
                                }
                            }}
                            toolNum={1}
                            icon={<BorderColorRounded/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                cleanup();
                                if(optionDisplay === 'text'){
                                    setOptionDisplay('none')
                                } else {
                                    setOptionDisplay('text')
                                }
                            }}
                            toolNum={2}
                            icon={<TextFields/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'shapes'}
                            onClick={()=>{
                                setOptionDisplay('none');
                                setToolSelected('circle');
                            }}
                            toolNum={3}
                            option={1}
                            icon={<RadioButtonUnchecked/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'shapes'}
                            onClick={()=>{
                                setOptionDisplay('none');
                                setToolSelected('rectangle');
                            }}
                            toolNum={3}
                            option={2}
                            icon={<CheckBoxOutlineBlank/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'shapes'}
                            onClick={()=>{
                                setOptionDisplay('none');
                                setToolSelected('star');
                            }}
                            toolNum={3}
                            option={3}
                            icon={<StarBorder/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                cleanup();
                                if(optionDisplay === 'shapes'){
                                    setOptionDisplay('none');
                                } else {
                                    setOptionDisplay('shapes');
                                }
                            }}
                            toolNum={3}
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
                            toolNum={4}
                            icon={<Palette/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={() => {
                                cleanup();
                                if(optionDisplay === 'sizePicker'){
                                    setOptionDisplay('none')
                                } else {
                                    setOptionDisplay('sizePicker')
                                }
                            }}
                            toolNum={5}
                            icon={<Height/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                setUndoState(false);
                                setWipe(true);
                            }}
                            toolNum={6}
                            icon={<DeleteForever/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                cleanup();
                                setToolDisplay('closed')}}
                            toolNum={7}
                            icon={<Close/>}
                            small={true}
                />
                {(optionDisplay === 'palette')? colorPicker:null}
                {(optionDisplay === 'sizePicker')? heightSlider:null}
            </div>
        ]
    )
}
