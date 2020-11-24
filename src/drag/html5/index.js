function dragstartHandler(event){
    console.log("drag start");
    event.dataTransfer.setData("text/plain", "hahaahahahahahah");
}

function dragendHandler(event){
    console.log("drag end");
    let data = event.dataTransfer.getData("text");
    console.log(data);
}

function dropHandler(event){
    console.log("drag drop")
    let data = event.dataTransfer.getData("text");
    console.log(data);
}

function dragoverHandler(event){
    console.log("drag over")
    event.preventDefault();
    // let data = event.dataTransfer.getData("text");
    // console.log(data);
}