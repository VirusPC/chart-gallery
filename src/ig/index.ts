import * as d3 from "d3"
import { IgnorePlugin } from "webpack";
import {Data, ViewElement} from "./ig-lib"
import * as ig from "./ig-lib"

const selectorRoot = "#point";
const width = 300;
const height =  200;

const fruits: Data = [
    {name: "apple", count: 21},
    {name: "grape", count: 13},
    {name: "peach", count: 8},
    {name: "banana", count: 5},
    {name: "pear", count: 3},
    {name: "lemon", count: 2},
];
let scaleX: d3.ScaleBand<string> = d3.scaleBand().domain(fruits.map(d => d.name as string)).rangeRound([0, width]);
let scaleY: d3.ScaleLinear<number, number, never> = d3.scaleLinear().domain([0, d3.max(fruits.map(d => d.count as number))]).rangeRound([height, 0]).nice();



let axisX: ViewElement = (root, scales, data) => {
    // console.log(scales);
    d3.axisBottom(scales['scaleX'])(root);
};
let axisY: ViewElement = (root, scales, data) => {
    d3.axisLeft(scales['scaleY'])(root)
};
let rects: ViewElement = (root, scales, data) => root.selectAll("rect")
                                                    .data(fruits)
                                                    .enter()
                                                    .append("rect")
                                                        .attr("x", d => scales['scaleX'](d.name as string))
                                                        .attr("y", d => scales['scaleY'](d.count as number))
                                                        .attr("width", scales['scaleX'].bandwidth())
                                                        .attr("height", d => scales['scaleY'](0) - scales['scaleY'](d.count as number))
                                                        .attr("fill", "steelblue");



const view = ig.view(selectorRoot, width, height)
                    .setData(fruits)
                    .setScales({
                        scaleX: scaleX,
                        scaleY: scaleY
                    })
                    .setLayers({
                        axes: [axisX, axisY],
                        marks: [rects]
                    });



// const view2 = new IGView(selectorRoot, width, height)
//                     .setData({
//                         fruits: fruits
//                     })
//                     .setScales({
//                         scaleX: scaleX,
//                         scaleY: scaleY
//                     })
//                     .setLayers({
//                         axes: {
//                             axisX: axisX, 
//                             axisY: axisY
//                         },
//                         marks: {
//                             rects: rects
//                         }
//                     });

const success = view.render();


/**
 * 1. 为每个回调函数, 传递一个参数对象, 包含该视图的所有参数(也可以自定义参数). 然后回调函数自己取出需要的参数来绘图. 
 * 2. 接着1, 用户可以自己确定放到什么位置.
 * 3. 语法提供默认布局, 默认哪个组件放在哪个位置? 需要对view的组成成分进行细分. (scale可能传入scaleX, scaleY, scaleColor 等, 极坐标也有scale, 分类比较困难) 
 */
