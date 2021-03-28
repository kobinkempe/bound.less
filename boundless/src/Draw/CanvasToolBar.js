import {ClickAwayListener, Fab} from "@material-ui/core";
import {
    AllOut,
    BorderColorRounded,
    Close,
    DeleteForever,
    FormatShapes,
    Height,
    Palette,
    Undo,
    Work
} from "@material-ui/icons";
import LogoSmallIcon from "../Images/toolbarIcons/logoSmall";
import {HexColorPicker} from "react-colorful";
import styles from "../Stylesheets/CanvasPage.css";
import WidthSlider from "./Toolbar/WidthSlider";
import {useState} from "react";
import {useHistory} from "react-router-dom";




export default function CanvasToolbar({setToolSelected,
                                      selectColor,
                                      setSelectColor,
                                      setWipe,
                                      lineWidth,
                                      setLineWidth,
                                      setUndoState}){
    //Toolbar States
    const [toolDisplay, setToolDisplay] = useState('closed');

    //Palette
    const [openPalette, setOpenPalette] = useState(false);

    //Height parameter
    const [openLineWidth, setOpenLineWidth] = useState(false);

    const history = useHistory();

    //Realtime Database stupid thing
    // const [i, update] = useState(0);


    let cleanup = () => {
        setWipe(false);
        //setUndoState(false);

    }

    let logoIcon =
        <Fab className={'tool'}
             onClick={()=>{
                 history.push('/');
             }}>
            <LogoSmallIcon/>
        </Fab>;

    let openToolBar = [
        //Undo
        <Fab className={'tool'}
             onClick={()=>{
                 cleanup();
                 setUndoState();
                 console.log("Button Clicked");
             }}>
            <Undo/>
        </Fab>,



        //Pen
        <Fab className={'tool'}
             onClick={()=>{
                 cleanup();
                 setToolSelected('pen')
             }}>
            <BorderColorRounded/>
        </Fab>,
        //Palette
        <Fab className={'tool'}
             onClick={()=>{
                 if(openPalette){
                     setOpenPalette(false);
                 } else {
                     setOpenPalette(true);
                     //setToolDisplay('palette');
                 }
             }}>
            <Palette/>
        </Fab>,

        //TextBox
        <Fab className={'tool'}
             onClick={()=>{
                 cleanup();
                 setToolSelected('rectangle')
             }}>
            <FormatShapes/>
        </Fab>,

        //Weird Circle/Square thing
        <Fab className={'tool'}
             onClick={()=>{
                 cleanup();
                 setToolSelected('circle')
             }}>
            <AllOut/>
        </Fab>,


        //LineWidth
        <Fab className={'tool'}
             onClick={() => {
                 cleanup();
                 if(openLineWidth) {
                     setOpenLineWidth(false);
                 }else {
                     setOpenLineWidth(true);
                 }
             }
             }>
            <Height/>
        </Fab>,

        //Wipe Canvas Button
        <Fab className={'tool'}
             onClick={()=>{
                 setOpenLineWidth(false);
                 setUndoState(false);
                 // addCanvas(i);
                 // addCanvas(i + 'private', "John Doe", false);
                 // setTimeout(()=>{
                 //     canAccessCanvas(i + 'private', (ret)=>{console.log(ret)});
                 //     canAccessCanvas(i, ret => console.log(ret), 'Fred');
                 // }, 500);
                 // setTimeout(()=>{
                 //     makeCanvasPrivate(i, "John Doe", ()=>console.log("pass1"), ()=>console.log("fail1"))
                 // }, 5000);
                 // setTimeout(()=>{
                 //     removeCanvas(i, "John Doe", ()=>{console.log("pass2")}, ()=>{console.log("fail2")})
                 // }, 10000);
                 // update(i + 1);
                 setWipe(true);
             }}>
            <DeleteForever/>
        </Fab>,

        //X
        <Fab className={'tool'} size={'small'}
             onClick={()=>{
                 cleanup();
                 setToolDisplay('closed')}}>
            <Close/>
        </Fab>
    ];

    //The different popups being used in the toolbar
    let colorPicker =
        <ClickAwayListener onClickAway={()=>{setOpenPalette(false)}}>
            <div className='colorPickerWrapperC'>
                <HexColorPicker className={styles.small}
                                color={selectColor}
                                onChange={setSelectColor}
                />
            </div>
        </ClickAwayListener>

    let heightSlider =
        <div className={'hSlider'}>
            <WidthSlider onClick={setLineWidth} lineWidth={lineWidth}/>
        </div>


    switch (toolDisplay) {
        case 'closed':
            return (
                [
                    logoIcon,
                    <Fab className={'tool'} onClick={()=>{setToolDisplay('open')}}>
                        <Work/>
                    </Fab>
                ]
            )
        case 'open':
            return [
                logoIcon,
                openToolBar,
                (openPalette? colorPicker: null),
                (openLineWidth? heightSlider:null)
            ];
        default:
            return;
    }
}
