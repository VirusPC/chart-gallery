import * as d3 from 'd3';
import excentricLabeling from './exentric-labeing';

/**
 * @param {number} width
 * @param {number} height 
 * @param {string} colorField
 * @param {string} labelField 
 * 
 * @param {object} interactionParams
 * @param {string | number} interactionParams.lensRadius 
 * @param {string | number} interactionParams.fontSize
 * @param {string | number} interactionParams.maxLabelsNum
 * @param {boolean} interactionParams.shouldVerticallyCoherent open the function: vertically coherent labeling.
 * @param {boolean} interactionParams.shouldHorizontallyCoherent open the function: horizontally coherent labeling.
 */
export default function addExentricLabelingInteraction(root, width, height, colorScale, colorField, labelField, interactionParams) {
    const { lensRadius, fontSize, maxLabelsNum } = interactionParams;

    const stroke = "green",
        strokeWidth = "1px",
        countLabelWidth = lensRadius * 2,
        countLabelDistance = 20;

    const tooltipGroup = root.append("g")
        .attr("class", "tooltip")
        .attr("visibility", "hidden");
    const lensGroup = tooltipGroup.append("g")
        .attr("class", "lens")
    const labelsGroup = tooltipGroup.append("g")
        .attr("class", "labels");
    const overlayGroup = root.append("g")
        .attr("class", "overlay");

    overlayGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("opacity", 0)
        .on("mouseenter", onMouseenter)
        .on("mousemove", e => window.requestAnimationFrame(onMousemove.bind(this, e)))
        .on("mouseleave", onMouseleave)
    lensGroup.append("circle")
        .attr("class", "lens")
        .attr("cx", 0)
        .attr("cx", 0)
        .attr("r", lensRadius)
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
    const countLabel = lensGroup
        .append("text")
        .text("0")
        .attr("y", -(countLabelDistance + lensRadius))
        .attr("font-size", fontSize)
        .attr("text-anchor", "middle")
        .attr("fill", stroke);
    const countLabelBBox = countLabel.node().getBBox();
    lensGroup.append("rect")
        .attr("class", "lensLabelBorder")
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("fill", "none")
        .attr("x", - countLabelWidth >> 1)
        .attr("y", countLabelBBox.y)
        .attr("width", countLabelWidth)
        .attr("height", countLabelBBox.height);
    lensGroup.append("line")
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("y1", -lensRadius)
        .attr("y2", countLabelBBox.y + countLabelBBox.height)
    function onMouseenter() {
        tooltipGroup.attr("visibility", "visible");
    }
    function onMousemove(e) {
        const pointerPos = d3.pointer(e, root.node());
        lensGroup.attr("transform", `translate(${pointerPos[0]}, ${pointerPos[1]})`)
        const objs = searchObjectsInCircle(root, pointerPos[0], pointerPos[1], lensRadius);
        countLabel.text(objs.length);
        labelsGroup.selectAll("*").remove();
        if(!objs || objs.length<=1) return;
        labelsGroup.call(renderLabelsAndLines, pointerPos[0], pointerPos[1], lensRadius, objs, maxLabelsNum, colorField, labelField, colorScale);
    }
    function onMouseleave() {
        tooltipGroup.attr("visibility", "hidden");
    }
}

function searchObjectsInCircle(g, cx, cy, r) {
    const objects = g.selectAll(":scope>:not(.overlay):not(.lens):not(.labels)");  // direct children except elements about interaction.
    const filteredObjs = [];
    for (const obj of objects) {
        const x = obj.getAttribute("cx");
        const y = obj.getAttribute("cy");
        const dist = Math.sqrt((cx - x) ** 2 + (cy - y) ** 2);
        if (dist <= r) {
            filteredObjs.push(obj);
        }
    }
    return filteredObjs;
}

function renderLabelsAndLines(root, cx, cy, r, objs, maxLabelsNum, colorField, labelField, colorScale) {
    if(!objs || objs.length<=0){
        console.log(objs);
        return;
    }
    const rawInfos = getRawInfos(objs, colorField, labelField, colorScale);
    computeSizeOfLabels(rawInfos, root);
    const layoutInfos = excentricLabeling(rawInfos, cx, cy, r, maxLabelsNum);
    renderControlPointsForTest(root, layoutInfos)
    renderLines();
    renderLabelsAndLines();
}

function renderControlPointsForTest(root, objInfos){
    if(!objInfos && objInfos.length <= 0) return;
    const controlPointsNum = objInfos[0].controlPoints.length;
    const testGroup = d3.create("svg:g");
    for(let i = 1; i < controlPointsNum; i++){
        testGroup.append("g").selectAll("circle").data(objInfos).join("circle")
            .attr("cx", d => d.controlPoints[i].x)
            .attr("cy", d => d.controlPoints[i].y)
            .attr("fill", d => d.left ? "red" : "blue")
            .attr("r", 3);
    }
    root.node().appendChild(testGroup.node());
}



function getRawInfos(objs, colorField, labelField, colorScale) {
    const rawInfos = objs
        .map(obj => {
            const bbox = obj.getBBox();
            const x = bbox.x + (bbox.width >> 1);
            const y = bbox.y + (bbox.height >> 1);
            const labelName = d3.select(obj).datum()[labelField];
            const color = colorScale(d3.select(obj).datum()[colorField]);
            return {
                x, y, color, labelName, labelWidth: 0, labelHeight: 0
            };
        });
    return rawInfos;
}


function computeSizeOfLabels(rawInfos, root) {
    const tempInfoAttr = "labelText";
    const tempClass = "temp" + String(new Date().getMilliseconds());
    const tempMountPoint = d3.create("svg:g").attr("class", tempClass);
    rawInfos.forEach(rawInfo =>
        rawInfo[tempInfoAttr] = tempMountPoint.append("text")
            .attr("opacity", "0")
            .attr("x", -Number.MAX_SAFE_INTEGER)
            .attr("y", -Number.MAX_SAFE_INTEGER)
            .text(rawInfo.labelName)
            .node() // 方便得到label的bbox, 以计算布局.
    );
    root.node().appendChild(tempMountPoint.node());
    rawInfos.forEach(rawInfo => {
        const labelBBox = rawInfo[tempInfoAttr].getBBox();
        rawInfo.labelWidth = labelBBox.width;
        rawInfo.labelHeight = labelBBox.height;
    });
    root.select("." + tempClass).remove();
    rawInfos.forEach(rawInfo => delete rawInfo[tempInfoAttr]);
}

function renderTempLabels() { }

function moveLabels() { }

function renderLines() { }

function renderBBoxs() { }



function getXYfromTransform(node) {
    try {
        const transform = node
            .attr("transform")
            .split("(")[1]
            .split(")")[0]
            .split(",")
            .map((i) => parseFloat(i));
        return transform;
    } catch (e) {
        return [0, 0];
    }
}