function inside(x,y,H,W){

    return (
        x>=0 &&
        x<H &&
        y>=0 &&
        y<W
    );
}

function getArea(i,j,H,W){

    const arr=[];

    for(let dx=-1;dx<=1;dx++){
        for(let dy=-1;dy<=1;dy++){

            const x=i+dx;
            const y=j+dy;

            if(inside(x,y,H,W)){
                arr.push([x,y]);
            }
        }
    }

    return arr;
}
