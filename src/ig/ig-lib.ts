import * as d3 from 'd3'

export type DataEntry = {[props: string]: string | number};
export type Data = DataEntry[];
export type ViewElement = (root: d3.Selection<SVGGElement, any, any, any>, scales: any, data?: Data) => d3.Selection<any, any, any, any> | void;
export type Layers = Partial<{
                        backgrounds: ViewElement[],
                        axes: [ViewElement, ViewElement],
                        marks: ViewElement[],
                        selections: ViewElement[]
                    }>
export type Scales = {[name: string]: any};

export function view(selector:string, width: number, height: number){
    return new IGView(selector, width, height);
}

export class IGView {
    selector: string;
    width: number;
    height: number;
    data: Data;
    layers: Layers = {};
    scales: Scales = {};
    margin = {top: 100, right: 100, bottom: 100, left: 100};

    constructor(selector:string, width: number, height: number) {
        this.selector = selector;
        this.width = width;
        this.height = height;
    }

    setData(data: Data) {
        this.data = data;
        return this;
    }

    setScale(name: string, scale: any) {
        this.scales[name] = scale;
        return this;
    }

    setScales(scales: Scales) {
        this.scales = scales
        return this;
    }
 
    setLayers(layers: Layers): IGView {
        this.layers = layers;
        return this;
    }

    render(): boolean {
        if(this.selector=="" || !this.selector || !this.width || !this.height){
            return false;
        }

        // get root node
        const svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select(this.selector)
            .append("svg")
            .attr("class", "ig-svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);
        
        // create group for each layer
        const groupBackground: d3.Selection<SVGGElement, unknown, HTMLElement, any> = svg.append("g").attr("class", "ig-background");
        const groupMarks: d3.Selection<SVGGElement, unknown, HTMLElement, any> = svg.append("g").attr("class", "ig-marks");
        const groupAxes: d3.Selection<SVGGElement, unknown, HTMLElement, any> = svg.append("g").attr("class", "ig-axes");
        const groupSelection: d3.Selection<SVGGElement, unknown, HTMLElement, any> = svg.append("g").attr("class", "ig-selection"); 

        // get callbacks to create each layer
        const {axes, marks} = this.layers;
        const [axisX, axisY] = axes;

        // draw chart
        const groupAxisX = groupAxes.append("g").attr("class", "axisX");
        const groupAxisY = groupAxes.append("g").attr("class", "axisY");
        axisX(groupAxisX, this.scales, this.data);
        axisY(groupAxisY, this.scales, this.data);
        marks.forEach(me => me(groupMarks.append("g").attr("class", "mark-rect"), this.scales, this.data));

        // ajust position of each group
        groupAxisX.attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`);
        groupAxisY.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
        groupMarks.attr("transform", `translate(${this.margin.left}, ${this.margin.right})`);
        
        return false;
    }

}

export class IGMultiView {}