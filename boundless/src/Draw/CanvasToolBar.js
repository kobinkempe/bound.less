import {ClickAwayListener, Fab} from "@material-ui/core";
import {
    BorderColorRounded,
    Close,
    DeleteForever,
    Height,
    Palette,
    Undo,
    Apps,
    Gesture,
    DragIndicator, Remove, Extension, RadioButtonUnchecked, CheckBoxOutlineBlank, StarBorder
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

    //Palette
    const [openPalette, setOpenPalette] = useState(false);

    //Height parameter
    const [openLineWidth, setOpenLineWidth] = useState(false);

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

    //The different popups being used in the toolbar
    let colorPicker =
        <ClickAwayListener onClickAway={()=>{setOpenPalette(false)}}>
            <div className='colorPickerWrapperC'>
                <HexColorPicker className={"small"}
                                color={selectColor}
                                onChange={setSelectColor}
                />
            </div>
        </ClickAwayListener>

    let heightSlider =
        <div className={'hSlider'}>
            <WidthSlider onClick={setLineWidth} lineWidth={lineWidth}/>
        </div>

    let getTransform = (tool=0, option=0) => {
        let moveX = 65*option;
        let moveY = 65*tool;
        return "translate3d(" + moveX + "px," + moveY + "px,0)"
    }

    return(
        [
            logoIcon,
            <div className={'toolBarTools'}>
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                if(toolDisplay==='open'){
                                    cleanup();
                                    setUndoState();
                                    //setUndoState(true);
                                    console.log("Button Clicked");
                                } else {
                                    setToolDisplay('open')
                                }
                            }}
                            toolNum={0}
                            icon={(toolDisplay==='open')?<Undo/>:<Apps/>}/>
                <ToolButton toolDisplay={toolDisplay}
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
                            optionDisplay={optionDisplay === 'shapes'}
                            onClick={()=>{
                                setOptionDisplay('none');
                                setToolSelected('circle');
                            }}
                            toolNum={2}
                            option={1}
                            icon={<RadioButtonUnchecked/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'shapes'}
                            onClick={()=>{
                                setOptionDisplay('none');
                                setToolSelected('rectangle');
                            }}
                            toolNum={2}
                            option={2}
                            icon={<CheckBoxOutlineBlank/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            optionDisplay={optionDisplay === 'shapes'}
                            onClick={()=>{
                                setOptionDisplay('none');
                                setToolSelected('star');
                            }}
                            toolNum={2}
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
                            toolNum={2}
                            icon={<Extension/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                if(openPalette){
                                    setOpenPalette(false);
                                } else {
                                    setOpenPalette(true);
                                    //setToolDisplay('palette');
                                }
                            }}
                            toolNum={3}
                            icon={<Palette/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={() => {
                                cleanup();
                                if(openLineWidth) {
                                    setOpenLineWidth(false);
                                }else {
                                    setOpenLineWidth(true);
                                }
                            }}
                            toolNum={4}
                            icon={<Height/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                setOpenLineWidth(false);
                                setUndoState(false);
                                setWipe(true);
                            }}
                            toolNum={5}
                            icon={<DeleteForever/>}
                />
                <ToolButton toolDisplay={toolDisplay}
                            onClick={()=>{
                                cleanup();
                                setToolDisplay('closed')}}
                            toolNum={6}
                            icon={<Close/>}
                            small={true}
                />
                {openPalette? colorPicker:null}
                {openLineWidth? heightSlider:null}
            </div>
        ]
    )
}
