fetch("./puzzles/cat.json")
.then(r=>r.json())
.then(data=>{

const H=data.size_y;
const W=data.size_x;

const hints=data.hints;

let states=[...Array(H)].map(()=>Array(W).fill(0));

let mouseDown=false;
let drawMode=null;
let dragSourceState=null;
let editMode=false;

let touched=new Set();

const undoStack=[];
const redoStack=[];

const board=document.getElementById("board");
const answerBoard=document.getElementById("answerBoard");

board.className="grid";
answerBoard.className="grid";

board.style.gridTemplateColumns=`repeat(${W},24px)`;
answerBoard.style.gridTemplateColumns=`repeat(${W},24px)`;

const cells=[];

for(let i=0;i<H;i++){

    cells[i]=[];

    for(let j=0;j<W;j++){

        const key=`${i},${j}`;

        const cell=document.createElement("div");

        cell.className="cell";

        const black=document.createElement("div");

        black.className="player-black";

        cell.appendChild(black);

        if(key in hints){

            const hint=document.createElement("div");

            hint.className="hint";

            hint.dataset.value=hints[key];

            hint.textContent=hints[key];

            cell.appendChild(hint);
        }

        const x=document.createElement("div");

        x.className="player-x";

        x.textContent="×";

        cell.appendChild(x);

        cell.blackLayer=black;
        cell.xLayer=x;
        cell.hintLayer=cell.querySelector(".hint");

        cell.dataset.x=i;
        cell.dataset.y=j;

        cells[i][j]=cell;

        board.appendChild(cell);

        cell.addEventListener("mousedown",e=>{

            e.preventDefault();

            touched.clear();

            mouseDown=true;

            drawMode=e.button===0?"black":"x";

            dragSourceState=states[i][j];

            pushHistory();

            apply(cell,e.button);
        });

        cell.addEventListener("mouseenter",()=>{

            if(mouseDown){
                apply(cell,drawMode==="black"?0:2);
            }
        });
    }
}

for(let i=0;i<H;i++){
    for(let j=0;j<W;j++){

        const d=document.createElement("div");

        d.className="answer-cell";

        if(data.solution[i][j]){
            d.classList.add("answer-black");
        }

        answerBoard.appendChild(d);
    }
}

function pushHistory(){

    undoStack.push(
        JSON.stringify(states)
    );

    if(undoStack.length>30){
        undoStack.shift();
    }

    redoStack.length=0;
}

function refreshBoard(){

    for(let i=0;i<H;i++){
        for(let j=0;j<W;j++){

            const cell=cells[i][j];

            const s=states[i][j];

            cell.blackLayer.style.display=
                s===1
                ?
                "block"
                :
                "none";

            cell.xLayer.style.display=
                s===2
                ?
                "flex"
                :
                "none";
        }
    }
}

function clearAmbiguous(){

    for(let i=0;i<H;i++){
        for(let j=0;j<W;j++){

            cells[i][j].classList.remove(
                "ambiguous"
            );
        }
    }
}

function redrawHints(){

    for(let i=0;i<H;i++){
        for(let j=0;j<W;j++){

            const key=`${i},${j}`;

            const cell=cells[i][j];

            if(cell.hintLayer){
                cell.hintLayer.remove();
                cell.hintLayer=null;
            }

            if(key in hints){

                const hint=document.createElement("div");

                hint.className="hint";
                hint.dataset.value=hints[key];
                hint.textContent=hints[key];

                cell.appendChild(hint);

                cell.hintLayer=hint;
            }
        }
    }
}

function checkComplete(){

    for(let i=0;i<H;i++){
        for(let j=0;j<W;j++){

            const correct=data.solution[i][j];

            const player=states[i][j]===1?1:0;

            if(correct!==player){
                return;
            }
        }
    }

    document.body.innerHTML=`
    <h1 style="font-size:72px">
    Congratulation!!
    </h1>
    `;
}

function apply(cell,button){

    const x=Number(cell.dataset.x);
    const y=Number(cell.dataset.y);

    const key=`${x},${y}`;

    if(touched.has(key)){
        return;
    }

    touched.add(key);

    if(editMode){

        if(button===0){

            if(!(key in hints)){
                hints[key]=0;
            }
            else{
                hints[key]++;

                if(hints[key]>9){
                    delete hints[key];
                }
            }
        }

        else{

            if(key in hints){

                hints[key]--;

                if(hints[key]<0){
                    delete hints[key];
                }
            }
        }

        redrawHints();

        return;
    }

    const state=states[x][y];

    if(drawMode==="black"){

        if(dragSourceState===0){

            if(state!==0)return;

            states[x][y]=1;

            cell.blackLayer.style.display="block";
            cell.xLayer.style.display="none";
        }

        else if(dragSourceState===1){

            if(state!==1)return;

            states[x][y]=0;

            cell.blackLayer.style.display="none";
        }

        else{
            return;
        }
    }

    else{

        if(dragSourceState===0){

            if(state!==0)return;

            states[x][y]=2;

            cell.xLayer.style.display="flex";
            cell.blackLayer.style.display="none";
        }

        else if(dragSourceState===2){

            if(state!==2)return;

            states[x][y]=0;

            cell.xLayer.style.display="none";
        }

        else{
            return;
        }
    }

    updateHints(x,y);

    checkComplete();
}

function updateHints(cx,cy){

    for(let dx=-1;dx<=1;dx++){
        for(let dy=-1;dy<=1;dy++){

            const i=cx+dx;
            const j=cy+dy;

            if(!inside(i,j)){
                continue;
            }

            const cell=cells[i][j];

            const hint=cell.hintLayer;

            if(!hint){
                continue;
            }

            hint.classList.remove("hint-complete");
            hint.classList.remove("hint-error");

            const target=Number(hint.dataset.value);

            const area=getArea(i,j);

            let black=0;
            let xcount=0;

            for(const [ax,ay] of area){

                const s=states[ax][ay];

                if(s===1){
                    black++;
                }
                else if(s===2){
                    xcount++;
                }
            }

            if(black+xcount===area.length){
                hint.classList.add("hint-complete");
            }

            if(
                black>target ||
                xcount>area.length-target
            ){
                hint.classList.add("hint-error");
            }
        }
    }
}

document.addEventListener(
    "mouseup",
    ()=>{

        mouseDown=false;

        touched.clear();
    }
);

document.addEventListener(
    "contextmenu",
    e=>e.preventDefault()
);

modePlay.onclick=()=>{
    editMode=false;
};

modeEdit.onclick=()=>{
    editMode=true;
};

undoBtn.onclick=()=>{

    if(!undoStack.length)return;

    redoStack.push(
        JSON.stringify(states)
    );

    states=JSON.parse(undoStack.pop());

    refreshBoard();
};

redoBtn.onclick=()=>{

    if(!redoStack.length)return;

    undoStack.push(
        JSON.stringify(states)
    );

    states=JSON.parse(redoStack.pop());

    refreshBoard();
};

saveBtn.onclick=()=>{

    const out={
        size_x:W,
        size_y:H,
        solution:data.solution,
        hints:hints
    };

    const blob=new Blob(
        [JSON.stringify(out,null,2)],
        {type:"application/json"}
    );

    const a=document.createElement("a");

    a.href=URL.createObjectURL(blob);

    a.download="edited_puzzle.json";

    a.click();
};

checkBtn.onclick=()=>{

    clearAmbiguous();

    const ambiguous=[];

    for(let i=0;i<H;i++){
        for(let j=0;j<W;j++){

            if(states[i][j]===0){

                ambiguous.push([i,j]);
            }
        }
    }

    if(ambiguous.length===0){

        alert("Unique likely OK");

        return;
    }

    for(const [x,y] of ambiguous){

        cells[x][y].classList.add(
            "ambiguous"
        );
    }

    alert(
        "Possible ambiguous cells: "
        +
        ambiguous.length
    );
};

let answerVisible=true;

toggleAnswer.onclick=()=>{

    answerVisible=!answerVisible;

    answerBoard.style.opacity=
        answerVisible
        ?
        1
        :
        0;
};

});
