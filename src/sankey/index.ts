import * as d3 from "d3";
import { D3BrushEvent } from "d3";

let svg: d3.Selection<SVGSVGElement, null, any, unknown> = d3.selectAll("svg");
let svg2: d3.Selection<SVGSVGElement, null, any, unknown>  = d3.select("svg");
console.log(svg);
console.log(svg2);

svg
    .attr("width", 100)
    .attr("height", 100)
    .attr("viewbox", "0 0 100 100")
    .attr("fill", "steelblue");

svg.append("rect").attr("height", 100).attr("width", 100).attr("fill", "green");