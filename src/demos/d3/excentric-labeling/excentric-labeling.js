import * as d3 from 'd3';

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
  const {lensRadius, fontSize, maxLabelsNum} = interactionParams;
  
  const stroke = "green",
    strokeWidth = "1px",
    countLabelWidth = lensRadius * 2,
    countLabelDistance = 20;

  const tooltipGroup = root.append("g")
    .attr("class", "tooltip")
    .attr("visibility", "hidden");
  const overlayGroup= root.append("g")
    .attr("class", "overlay");
  const lensGroup = tooltipGroup.append("g")
    .attr("class", "lens");

  overlayGroup.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("opacity", 0)
    .on("mouseenter", onMouseenter)
    .on("mousemove", onMousemove)
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
  const countLabelBBox= countLabel.node().getBBox();
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
      tooltipGroup.attr("transform", `translate(${pointerPos[0]}, ${pointerPos[1]})`)
  }
  function onMouseleave() {
      tooltipGroup.attr("visibility", "hidden");
  }
}


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