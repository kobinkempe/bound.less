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
    Create, Remove, Extension, Backspace, RadioButtonUnchecked, CheckBoxOutlineBlank, StarBorder,
    TextFields, Redo, PanTool, History, GetApp
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
                                      setUndo, setRedo,
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
            <div className='colorPickerWrapperC' style={{transform: getTransform(6, 1)}}>
                <HexColorPicker className={"small"}
                                color={selectColor}
                                onChange={setSelectColor}
                />
            </div>
        </ClickAwayListener>

    let heightSlider =
        <ClickAwayListener onClickAway={()=>{setOptionDisplay('none')}}>
            <div className={'hSlider'} style={{transform: getTransform(7, 1)}}>
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
                            icon={(toolDisplay==='open')?<Close/>:<Apps/>}
                            title={"Open/Close Toolbar"}/>
                <ToolButton toolDisplay={toolDisplay}
                            //Undo
                            optionDisplay = {optionDisplay === 'history'}
                            onClick={()=>{
                                setOptionDisplay('none');
                                setUndo(true);
                            }}
                            toolNum={1}
                            option={1}
                            icon={<Undo/>}
                            title={"Undo"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            //Redo
                            optionDisplay = {optionDisplay === 'history'}
                            onClick={()=>{
                                setOptionDisplay('none')
                                setRedo(true);
                            }}
                            toolNum={1}
                            option={2}
                            icon={<Redo/>}
                            title={"Redo"}
                />
                <ToolButton toolDisplay={toolDisplay}
                    // History (Undo and Redo)
                            onClick={()=>{
                                if(optionDisplay === 'history'){
                                    setOptionDisplay('none');
                                } else {
                                    setOptionDisplay('history');
                                }
                            }}
                            toolNum={1}
                            icon={<History/>}
                            title={"Undo/Redo"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            //Pan
                            optionDisplay={optionDisplay === 'pan'}
                            onClick={
                                ()=>{
                                    setToolSelected('pan')
                                }
                            }
                            toolNum={2}
                            icon={<PanTool/>}
                            title={"Pan"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            // Pen
                            optionDisplay={optionDisplay === 'pen'}
                            onClick={()=>{
                                setPenType(PEN_TYPES[0]);
                                setOptionDisplay('none');
                                setToolSelected('pen');
                            }}
                            toolNum={3}
                            option={1}
                            icon={<Create/>}
                            title={"Pen"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            //Highlight
                            optionDisplay={optionDisplay === 'pen'}
                            onClick={()=>{
                                setPenType(PEN_TYPES[1]);
                                setOptionDisplay('none');
                                setToolSelected('pen');
                            }}
                            toolNum={3}
                            option={2}
                            icon={<BorderColorRounded/>}
                            title={"Highlighter"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'pen'}
                            onClick={()=>{
                                setPenType(PEN_TYPES[2]);
                                setOptionDisplay('none');
                                setToolSelected('pen');
                            }}
                            toolNum={3}
                            option={3}
                            icon={<Remove/>}
                            title={"Line"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'pen'}
                            onClick={()=>{
                                setPenType(PEN_TYPES[3]);
                                setOptionDisplay('none');
                                setToolSelected('pen');
                            }}
                            toolNum={3}
                            option={4}
                            icon={<Backspace/>}
                            title={"Erase"}
                />

                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                if(optionDisplay === 'pen'){
                                    setOptionDisplay('none');
                                } else {
                                    setOptionDisplay('pen');
                                }
                            }}
                            toolNum={3}
                            icon={<Gesture/>}
                            title={"Drawing Tools"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay=== 'text'}
                            onClick={()=> {
                                setOptionDisplay('none');
                                setToolSelected('text');
                            }}
                            toolNum={4}
                            icon={<TextFields/>}
                            title={"Text"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'shapes'}
                            onClick={()=>{
                                setOptionDisplay('none');
                                setToolSelected('circle');
                            }}
                            toolNum={5}
                            option={1}
                            icon={<RadioButtonUnchecked/>}
                            title={"Circle"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'shapes'}
                            onClick={()=>{
                                setOptionDisplay('none');
                                setToolSelected('rectangle');
                            }}
                            toolNum={5}
                            option={2}
                            icon={<CheckBoxOutlineBlank/>}
                            title={"Square"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'shapes'}
                            onClick={()=>{
                                setOptionDisplay('none');
                                setToolSelected('star');
                            }}
                            toolNum={5}
                            option={3}
                            icon={<StarBorder/>}
                            title={"Star"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                if(optionDisplay === 'shapes'){
                                    setOptionDisplay('none');
                                } else {
                                    setOptionDisplay('shapes');
                                }
                            }}
                            toolNum={5}
                            icon={<Extension/>}
                            title={"Shapes"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                if(optionDisplay === 'palette'){
                                    setOptionDisplay('none')
                                } else {
                                    setOptionDisplay('palette')
                                }
                            }}
                            toolNum={6}
                            icon={<Palette/>}
                            title={"Color Picker"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={() => {
                                if(optionDisplay === 'sizePicker'){
                                    setOptionDisplay('none')
                                } else {
                                    setOptionDisplay('sizePicker')
                                }
                            }}
                            toolNum={7}
                            icon={<Height/>}
                            title={"Change Size"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                setWipe(true);
                            }}
                            toolNum={8}
                            icon={<DeleteForever/>}
                            title={"Wipe"}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                setToolSelected('download');
                            }}
                            toolNum={8}
                            icon={<GetApp/>}
                            title={"Download your SVG"}
                />
                {(optionDisplay === 'palette')? colorPicker:null}
                {(optionDisplay === 'sizePicker')? heightSlider:null}
            </div>
        ]
    )
}
