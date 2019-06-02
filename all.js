/* eslint-disable no-eval */
/* eslint-disable no-trailing-spaces */
/* eslint-disable indent */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */

window.onload = () => {
    let activeTool = 'none';
    let colors = {
        currentColor: '',
        previousColor: '',
    };

    let itemMoved;
    const body = document.body;
    const tool = document.querySelector('.tools');
    const field = document.querySelector('.field');
    const currentColorIndicator = document.getElementById('currentColor');
    const previousColorIndicator = document.getElementById('previousColor');
    const items = Array.from(field.children);
    const cursors = {
        fill: 'url(\'./assets/paint-bucket.svg\') 20 20, auto',
        picker: 'url(\'./assets/color-picker.svg\') 0 20, auto',
        move: 'url(\'./assets/move.svg\') 20 20, auto',
        transform: 'url(\'./assets/transform.svg\') 10 10, auto',
        reset: '',
    };
    const addButton = document.querySelector('.frameplus');
    let fieldState = [];
    let canvasState = [];


    const changeCursor = (place, cursorName) => {
        place.style.cursor = cursors[cursorName];
    };
    const toggleItemsMobility = () => {
        if (activeTool === 'move') {
            items.forEach((element) => {
                element.setAttribute('draggable', 'true');
            });
        } else {
            items.forEach((element) => {
                element.removeAttribute('draggable', 'true');
            });
        }
    };

    const toggleActiveTool = (targetTool) => {
        const lastActiveTool = activeTool;
        activeTool === targetTool ? activeTool = 'none' : activeTool = targetTool;
        if (field.style.cursor) {
            changeCursor(field, 'reset');
        }
        if (body.style.cursor) {
            changeCursor(body, 'reset');
        }
        if (targetTool === 'move' || lastActiveTool === 'move') {
            toggleItemsMobility();
            toggleDragnDrop();
        }
    };

    /* ---------control functions---------------*/
    const loadStates = () => {
        if (localStorage.getItem('fieldState')) {
            fieldState = JSON.parse(localStorage.getItem('fieldState'));
        }
        if (localStorage.getItem('colorState')) {
            colors = JSON.parse(localStorage.getItem('colorState'));
        }
    };
    const applyStates = (number) => {
        const place = Number(number) - 1;
        previousColorIndicator.style.backgroundColor = colors.previousColor;
        currentColorIndicator.style.backgroundColor = colors.currentColor;
        items.forEach((e, i) => {
            if (fieldState[place][i] && fieldState[place][i].color) {
                e.style.backgroundColor = fieldState[place][i].color;
            }
            if (fieldState[place][i] && fieldState[place][i].classAdd) {
                e.classList.add(fieldState[place][i].classAdd);
            }
        });
    };
    const getFieldForFrame = () => {
        const currentNodes = [...document.getElementsByClassName('item')];
        const fieldForFrame = currentNodes.map((e) => {
            const nodeState = {
                color: undefined,
                classAdd: undefined,
            };
            if (e.classList.length > 1) {
                nodeState.classAdd = e.classList[1];
            }
            if (e.style.backgroundColor) {
                nodeState.color = e.style.backgroundColor;
            }
            return nodeState;
        });
        return fieldForFrame;
    };
    const saveFieldState = (copyIndicator) => {
        const activeFrame = document.querySelector('.active-frame');
        const number = activeFrame.querySelector('.frame__canvas').id;
        const place = Number(number) - 1;
        const fieldForFrame = getFieldForFrame();
        if (copyIndicator) {
            fieldState.splice(place, 0, fieldForFrame);
        } else {
            fieldState.splice(place, 1, fieldForFrame);
        }

        const fieldStateString = JSON.stringify(fieldState);
        localStorage.setItem('fieldState', fieldStateString);
    };
    const saveColors = () => {
        const colorsString = JSON.stringify(colors);
        localStorage.setItem('colorState', colorsString);
    };
    const itemBehaviour = (event) => {
        const target = event.target;
        switch (activeTool) {
            case 'fill':
                fill(target);
                break;
            case 'transform':
                transform(target);
                break;
            default:
                break;
        }
    };
    const chooseEvent = (event) => {
        let target = event.target;
        while (!target.className || target.className === 'icon') {
            target = target.parentNode;
        }
        switch (target.className) {
            case 'paint_bucket':
                fillActivate();
                break;
            case 'color_pick':
                picker();
                break;
            case 'move':
                moveActivate();
                break;
            case 'transform':
                transformTool();
                break;
            default:
                break;
        }
    };

    const keyChooseEvent = (event) => {
        const keycode = event.keyCode;
        switch (keycode) {
            case 102:
                fillActivate();
                break;
            case 112:
                picker();
                break;
            case 109:
                moveActivate();
                break;
            case 116:
                transformTool();
                break;
            default:
                break;
        }
    };


    /* ----------------functionals-----------------*/


    /* fill */

    const fillActivate = () => {
        toggleActiveTool('fill');
        changeCursor(body, 'fill');
    };

    const fill = (target) => {
        const activeFrame = document.querySelector('.active-frame');
        const canvas = activeFrame.querySelector('.frame__canvas');
        if (target.className === 'item' || target.className === 'item item__round') {
            target.style.backgroundColor = colors.currentColor;
            saveFieldState();
            fillFrame(activeFrame, canvas.id);
            saveCanvas(canvas);
            toggleActiveTool('fill');
            changeCursor(body, 'reset');
        }
    };


    const colorPick = (event) => {
        const settleColor = (pickedColor) => {
            if (pickedColor) {
                colors.previousColor = colors.currentColor;
                colors.currentColor = pickedColor;
                previousColorIndicator.style.backgroundColor = colors.previousColor;
                currentColorIndicator.style.backgroundColor = colors.currentColor;
            }
            saveColors();
            document.body.removeEventListener('mousedown', colorPick);
            toggleActiveTool('picker');
            changeCursor(body, 'reset');
        };
        const pickedColor = window.getComputedStyle(event.target, null).getPropertyValue('background-color');
        settleColor(pickedColor);
    };
    const picker = () => {
        toggleActiveTool('picker');
        changeCursor(body, 'picker');
        document.body.addEventListener('mousedown', colorPick);
    };
    /* transform */

    const preventDefaultBehaviour = (event) => {
        event.preventDefault();
    };
    const transformTool = () => {
        toggleActiveTool('transform');
        changeCursor(field, 'transform');
    };
    const transform = (target) => {
        const activeFrame = document.querySelector('.active-frame');
        const canvas = activeFrame.querySelector('.frame__canvas');
        const classes = target.classList;
        if (Array.from(classes).includes('item__round')) {
            classes.remove('item__round');
        } else {
            classes.add('item__round');
        }
        saveFieldState();
        fillFrame(activeFrame, canvas.id);
        saveCanvas(canvas);
        toggleActiveTool('transform');
        changeCursor(field, 'reset');
    };

    /* move */


    function swapDivs(event) {
        const div1 = itemMoved;
        const div2 = event.target;

        div2.style.border = '';
        const next2 = div2.nextSibling;
        // special case for obj1 is the next sibling of obj2
        if (next2 === div1) {
            field.insertBefore(div1, div2);
        } else {
            field.insertBefore(div2, div1);
            if (next2) {
                field.insertBefore(div1, next2);
            } else {
                field.appendChild(div1);
            }
        }
    }
    const dragstarted = (event) => {
        itemMoved = event.target;
    };

    const higlightDroparea = (event) => {
        if (event.target.className === 'item' || event.target.className === 'item item__round') {
            event.target.style.border = '3px solid lime';
        }
    };
    const resetItemBorder = (event) => {
        if (event.target.className === 'item' || event.target.className === 'item item__round') {
            event.target.style.border = '';
        }
    };

    const dropItem = (event) => {
        preventDefaultBehaviour(event);
        resetItemBorder(event);
        swapDivs(event);
        toggleActiveTool('move');
    };
    const cancelDrop = () => {
        toggleActiveTool('move');
    };

    const moveActivate = () => {
        toggleActiveTool('move');
        changeCursor(field, 'move');
    };
    const toggleDragnDrop = () => {
        if (activeTool === 'move') {
            body.addEventListener('dragend', cancelDrop);
            field.addEventListener('dragstart', dragstarted);
            field.addEventListener('dragover', preventDefaultBehaviour);
            field.addEventListener('dragenter', higlightDroparea);
            field.addEventListener('dragleave', resetItemBorder);
            field.addEventListener('drop', dropItem);
        } else {
            body.removeEventListener('dragend', cancelDrop);
            field.removeEventListener('dragstart', dragstarted);
            field.removeEventListener('dragover', preventDefaultBehaviour);
            field.removeEventListener('dragenter', higlightDroparea);
            field.removeEventListener('dragleave', resetItemBorder);
            field.removeEventListener('drop', dropItem);
        }
    };
    const resetField = () => {
        items.forEach((item) => {
            if (item.classList.contains('item__round')) {
                item.classList.remove('item__round');
            }
            item.style.backgroundColor = '#E5E5E5';
        });
    };

    /* ----------------- frames --------------*/

    const deleteFrame = (event) => {
        event.stopPropagation();
        const target = targetToFrame(event);
        const previous = target.previousElementSibling;
        const parent = target.parentNode;
        const frames = [...parent.children];


        if (target !== parent.lastElementChild) {
            const targetIndex = frames.indexOf(target);

            frames.forEach((frame, index) => {
                if (index > targetIndex) {
                    const newNumber = (index);
                    changeFrameNumber(frame, newNumber);
                }
            });

            canvasState.splice((targetIndex - 1), 1);
            console.log(canvasState);
        }

        if (target.classList.contains('active-frame')) {
            makeFrameActive(previous);
        }

        parent.removeChild(target);
    };

    const changeFrameNumber = (frame, newNumber) => {
        frame.querySelector('.frame__canvas').id = newNumber;
        frame.querySelector('.num').innerHTML = newNumber;
    };

    const addListenersToFrameControl = (control, controlClass) => {
        const listener = frameControlsAttributes[controlClass].listener;
        control.addEventListener('click', listener);
    };

    const clearActiveFrames = (frames) => {
        frames.forEach((frame) => {
            if (frame.classList.contains('active-frame')) {
                frame.classList.remove('active-frame');
            }
        });
    };

    const copyFrame = (event) => {
        const target = targetToFrame(event);
        const parent = target.parentNode;
        const numberParent = target.querySelector('.frame__canvas').id;
        const number = Number(numberParent) + 1;
        const frames = [...parent.children];

        clearActiveFrames(frames);

        const dupNode = target.cloneNode(true);
        changeFrameNumber(dupNode, number);
        dupNode.classList.add('active-frame');
        dupNode.addEventListener('click', makeFrameActive);

        const copyControl = dupNode.querySelector('.frame-copy');
        addListenersToFrameControl(copyControl, 'frame-copy');

        if (dupNode.querySelector('.frame-del')) {
            addListenersToFrameControl(dupNode.querySelector('.frame-del'), 'frame-copy');
        } else {
            const control = createControl('frame-del');
            dupNode.insertBefore(control, copyControl);
        }

        if (target !== parent.lastElementChild) {
            const targetIndex = frames.indexOf(target);

            frames.forEach((frame, index) => {
                if (index > targetIndex) {
                    const newNumber = (2 + index);
                    changeFrameNumber(frame, newNumber);
                }
            });

            parent.insertBefore(dupNode, target.nextSibling);
        } else {
            parent.appendChild(dupNode);
        }

        applyStates(numberParent);
        fillFrame(dupNode, numberParent);
        saveFieldState('copy');
        saveCanvas(dupNode.querySelector('.frame__canvas'), 'copy');
    };

    const frameControlsAttributes = {
        'frame-num': {
            class: 'frame-num',
            inner: 'h3',
            innerClass: ['num'],
            listener: null,
        },
        'frame-del': {
            class: 'frame-del',
            inner: 'i',
            innerClass: ['fa', 'fa-trash'],
            listener: deleteFrame,
        },
        'frame-copy': {
            class: 'frame-copy',
            inner: 'i',
            innerClass: ['fa', 'fa-clone'],
            listener: copyFrame,
        },
    };
    const frameControlsList = Object.keys(frameControlsAttributes);

    const calcTopCornerX = (index, pointPX) => {
        if (index === 0 || index === 3 || index === 6) {
            return 0;
        }
        if (index === 1 || index === 4 || index === 7) {
            return pointPX;
        }
        return (pointPX * 2);
    };

    const calcTopCornerY = (index, pointPX) => {
        if (index === 0 || index === 1 || index === 2) {
            return 0;
        }
        if (index === 3 || index === 4 || index === 5) {
            return pointPX;
        }
        return (pointPX * 2);
    };


    const getFrameNum = () => {
        const framesBlock = document.querySelector('.frames');
        const canvas = framesBlock.querySelectorAll('.frame > .frame__canvas');
        const last = canvas.item(canvas.length - 1);
        const lastNum = Number(last.id);
        return (lastNum + 1);
    };

    const createControl = (classSelf) => {
        const innerTag = frameControlsAttributes[classSelf].inner;
        const classInner = frameControlsAttributes[classSelf].innerClass;

        const control = document.createElement('div');
        control.classList.add('frame-control');
        control.classList.add(classSelf);
        addListenersToFrameControl(control, classSelf);
        const inner = document.createElement(innerTag);
        classInner.forEach(el => inner.classList.add(el));

        control.appendChild(inner);

        return control;
    };

    const createFrame = () => {
        const fragment = document.createDocumentFragment();
        const frame = document.createElement('div');
        const number = getFrameNum();
        frame.classList.add('frame');
        fragment.appendChild(frame);

        frameControlsList.forEach((e) => {
            const classSelf = frameControlsAttributes[e].class;
            const control = createControl(classSelf);
            frame.appendChild(control);
        });

        const counter = frame.querySelector('.num');
        counter.innerHTML = number;

        const canvas = document.createElement('canvas');
        canvas.classList.add('frame__canvas');
        canvas.id = number;
        frame.appendChild(canvas);

        return fragment;
    };

    const fillFrame = (frame, number) => {
        const canva = frame.querySelector('.frame__canvas');

        canva.width = canva.offsetWidth;
        canva.height = canva.offsetHeight;
        const ctx = canva.getContext('2d');
        const sidePoints = Math.sqrt(items.length);
        const sidePX = canva.width;
        const pointPX = sidePX / sidePoints;
        const halfPoint = pointPX / 2;
        const place = Number(number) - 1;

        items.forEach((e, i) => {
            if (fieldState[place][i] && fieldState[place][i].color && !fieldState[place][i].classAdd) {
                const x = calcTopCornerX(i, pointPX);
                const y = calcTopCornerY(i, pointPX);
                ctx.fillStyle = e.style.backgroundColor;
                ctx.fillRect(x, y, pointPX, pointPX);
            }
            if (fieldState[place][i] && fieldState[place][i].color && fieldState[place][i].classAdd) {
                const x = calcTopCornerX(i, pointPX) + halfPoint;
                const y = calcTopCornerY(i, pointPX) + halfPoint;
                ctx.fillStyle = e.style.backgroundColor;
                ctx.beginPath();
                ctx.arc(x, y, halfPoint, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    };


    const addNewFrame = () => {
        const frames = document.querySelector('.frames');
        const previousActive = document.querySelector('.active-frame');
        const newFrame = createFrame();

        frames.appendChild(newFrame);
        const frame = frames.lastChild;

        previousActive.classList.remove('active-frame');
        frame.classList.add('active-frame');
        frame.addEventListener('click', makeFrameActive);

        resetField();
        saveFieldState();
        saveCanvas(frame.querySelector('.frame__canvas'));
    };
    const targetToFrame = (event) => {
        let target = event.target;
        const targetFrame = () => {
            target = target.parentNode;
            if (!target.classList.contains('frame')) {
                targetFrame();
            }
            return target;
        };
        return targetFrame();
    };
    const makeFrameActive = (frame) => {
        console.log('start');
        const frames = [...document.querySelector('.frames').children];
        const target = frame.classList ? frame : targetToFrame(frame);
        console.log('target frameactive', target);

        const number = target.querySelector('.frame__canvas').id;
        clearActiveFrames(frames);
        target.classList.add('active-frame');
        console.log('classes frameactive', target.classList);

        resetField();
        applyStates(number);
        showAnimation();
    };

    const canvasToPng = canvas => canvas.toDataURL('image/png');

    const saveCanvas = (canvas, copyIndicator) => {
        const place = Number(canvas.id) - 1;
        const frameImage = canvasToPng(canvas);
        if (copyIndicator) {
            canvasState.splice(place, 0, frameImage);
        } else {
            canvasState.splice(place, 1, frameImage);
        }

        const canvasStateString = JSON.stringify(canvasState);
        localStorage.setItem('canvasState', canvasStateString);
    };
    const getNewBackground = (lastPosition) => {
        if (lastPosition === (canvasState.length - 1)) {
            return canvasState[0];
        }
        const newPosition = lastPosition + 1;
        return canvasState[newPosition];
    };
    const getInterval = fps => Math.round(1000 / fps);

    const setBackground = (pic) => {
        const animationContainer = document.querySelector('.animation-frame');
        const previewContainer = document.querySelector('.popup');
        animationContainer.style.backgroundImage = "url('" + pic + "')";
        previewContainer.style.backgroundImage = "url('" + pic + "')";
    };

    let lastPosition = 0;
    let timeout = getInterval(13);

    const showAnimation = () => {
        const newPic = getNewBackground(lastPosition);

        if (canvasState.length > 1) {
            lastPosition = (lastPosition === (canvasState.length - 1)) ? 0 : (lastPosition + 1);
        }
        setBackground(newPic);
    };
    let showAnimationInterval = setInterval(() => {
        showAnimation();
    }, timeout);

    const changeFPS = (event) => {
        const fps = event.target.value;
        timeout = getInterval(fps);
        changeFPSdisplay(fps);

        clearInterval(showAnimationInterval);
        showAnimationInterval = setInterval(() => {
            showAnimation();
        }, timeout);
    };

    const changeFPSdisplay = (fps) => {
        const display = document.querySelector('.fps-display > h3');
        display.innerHTML = `${fps} FPS`;
    };

    const displayFullscreen = () => {
        const popup = document.querySelector('.popup-bacground-hover');
        popup.style.display = 'block';
    };

    const hideFullscreen = () => {
        const popup = document.querySelector('.popup-bacground-hover');
        popup.style.display = 'none';
    };

    /* listeners */
    tool.addEventListener('click', chooseEvent);
    field.addEventListener('click', itemBehaviour);
    document.addEventListener('keypress', keyChooseEvent);
    addButton.addEventListener('click', addNewFrame);

    document.querySelector('.frame-copy').addEventListener('click', copyFrame);
    document.querySelector('.frame').addEventListener('click', makeFrameActive);
    document.querySelector('#fps').addEventListener('change', changeFPS);
    document.querySelector('.preview-button').addEventListener('click', displayFullscreen);
    document.querySelector('.popup-close-button').addEventListener('click', hideFullscreen);

    /* functions call */
    saveFieldState();
    saveCanvas(document.querySelector('.frame__canvas'));
    showAnimation();
};
