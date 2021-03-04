import {useCallback, useEffect} from "react";
import Two from "two.js";


const startPaint = useCallback((event) => {
    const coordinates = getsCoordinates(event);
    if (coordinates) {
        setMouse(coordinates);
        setIsDrawing(true);
    }
}, []);

useEffect(() => {
    if (!svgRef.current) {
        return;
    }
    const canvas  = svgRef.current;
    setTwo(new Two({fullscreen: true, autostart: true}).appendTo(svgRef.current));
    canvas.addEventListener('mousedown', startPaint);
    return () => {
        canvas.removeEventListener('mousedown', startPaint);
    };
}, [startPaint]);

const paint = useCallback(
    (event ) => {
        if (isDrawing) {
            const newMouse = getsCoordinates(event);
            if (mouse && newMouse) {
                drawLine(mouse, newMouse);
                setMouse(newMouse);
            }
        }
    },
    [isDrawing, mouse]
);

useEffect(() => {
    if (!svgRef.current) {
        return;
    }
    const canvas  = svgRef.current;
    canvas.addEventListener('mousemove', paint);
    return () => {
        canvas.removeEventListener('mousemove', paint);
    };
}, [paint]);

const exitPaint = useCallback(() => {
    setIsDrawing(false);
    setMouse(undefined);
}, []);

useEffect(() => {
    if (!svgRef.current) {
        return;
    }
    const canvas = svgRef.current;
    canvas.addEventListener('mouseup', exitPaint);
    canvas.addEventListener('mouseleave', exitPaint);
    return () => {
        canvas.removeEventListener('mouseup', exitPaint);
        canvas.removeEventListener('mouseleave', exitPaint);
    };
}, [exitPaint]);

const getsCoordinates = (event) => {
    if (!svgRef.current) {
        return;
    }

    const canvas  = svgRef.current;
    return [event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop];
};

const drawLine = (originalMousePosition,  newMouse) => {
    if (!svgRef.current) {
        return;
    }
    console.log("drawLine called")
    if (two.renderer === Two.Types.svg) {
        const path = two.makeLine(
            originalMousePosition[0],
            originalMousePosition[1],
            newMouse[0],
            newMouse[1]);
        path.stroke = "rgb(0,0,0)";
        path.curved = true;
        two.update();
    }
};
