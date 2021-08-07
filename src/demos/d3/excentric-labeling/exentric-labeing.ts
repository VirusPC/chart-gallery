type RawInfo = {
    x: number,
    y: number,
    color: string,
    labelName: string,
    labelWidth: number,
    labelHeight: number
}

type ControlPoint = { x: number, y: number }

type LayoutInfo = {
    x: number,
    y: number,
    name: string,
    color: string,
    left: boolean,
    controlPoints: ControlPoint[],
    labelBBox: {
        x: number,
        y: number,
        width: number,
        height: number
    }
}

export default function computeExentricLabelingLayout(rawInfos: RawInfo[], cx: number, cy: number, r: number, maxLabelsNum: number) {
    const layoutInfos = initLayoutInfos(rawInfos.slice(0, maxLabelsNum));
    computeStartPoints(layoutInfos);
    computePointsOnLens(layoutInfos, cx, cy, r);
    dividedIntoLeftOrRight(layoutInfos, cx, cy);
    computeMiddlePoints(layoutInfos, cx, cy, r);
    computeEndPoints(layoutInfos);
    return layoutInfos;
}

function initLayoutInfos(rawInfos: RawInfo[]): LayoutInfo[] {
    return rawInfos.map(initLayoutInfo);
}

function initLayoutInfo({ x, y, color, labelName, labelWidth, labelHeight }: RawInfo): LayoutInfo {
    return {
        x, y, color,
        name: labelName,
        controlPoints: [],
        left: true,
        labelBBox: {
            x: 0, y: 0, width: labelWidth, height: labelHeight,
        },
    }
}

function computeStartPoints(layoutInfos: LayoutInfo[]) {
    for (const layoutInfo of layoutInfos) {
        layoutInfo.controlPoints.push({
            x: layoutInfo.x,
            y: layoutInfo.y,
        });
    }
}

function computePointsOnLens(layoutInfos: LayoutInfo[], cx: number, cy: number, r: number): void {
    for (const layoutInfo of layoutInfos) {
        const startPoint = layoutInfo.controlPoints[0];
        if (startPoint === undefined) throw Error("no start points");
        const rad = Math.atan2(startPoint.y - cy, startPoint.x - cx);
        const endPoint = {
            x: cx + r * Math.cos(rad),
            y: cy + r * Math.sin(rad)
        }
        layoutInfo.controlPoints.push(endPoint);
    }
}

function computeMiddlePoints(layoutInfos: LayoutInfo[], cx: number, cy: number, r: number): void {
    const spaceX = 20; // space between the leftmost of lens and the middle points
    const spaceBetweenLabels = 3;
    const sortAccordingY = (li1: LayoutInfo, li2: LayoutInfo) => li1.controlPoints[li1.controlPoints.length - 1].y - li2.controlPoints[li2.controlPoints.length - 1].y;
    const computeSpaceHeight = (layoutInfos: LayoutInfo[], spaceBetweenLabels: number) => layoutInfos.reduce((acc, layoutInfo) => acc + layoutInfo.labelBBox.height, 0) + spaceBetweenLabels * (layoutInfos.length - 1);

    const layoutInfosLeft: LayoutInfo[] = [];
    const layoutInfosRight: LayoutInfo[] = [];
    layoutInfos.forEach(layoutInfo => layoutInfo.left ? layoutInfosLeft.push(layoutInfo) : layoutInfosRight.push(layoutInfo));

    if (layoutInfosLeft.length > 0) computeOneSide(layoutInfosLeft, spaceBetweenLabels, true);
    if (layoutInfosRight.length > 0) computeOneSide(layoutInfosRight, spaceBetweenLabels, false);

    function computeOneSide(layoutInfosOneSide: LayoutInfo[], spaceBetweenLabels: number, left: boolean) {
        layoutInfosOneSide.sort(sortAccordingY);
        const spaceHeight = computeSpaceHeight(layoutInfosOneSide, spaceBetweenLabels);
        let labelY = cy - (spaceHeight / 2)
        layoutInfosOneSide.forEach((layoutInfo, i, layoutInfos) => {
            if (i !== 0) {
                labelY += layoutInfos[i - 1].labelBBox.height + spaceBetweenLabels;
            }
            layoutInfo.controlPoints.push({
                x: left ? cx - r - spaceX : cx + r + spaceX,
                y: labelY + (layoutInfo.labelBBox.height >> 1)
            });
        });
    }
}

function computeEndPoints(layoutInfos: LayoutInfo[]): void {
    const computeMaxLabelWidth = (layoutInfos: LayoutInfo[]) => Math.max(...layoutInfos.map(layoutInfo => layoutInfo.labelBBox.width));
    const layoutInfosLeft: LayoutInfo[] = [];
    const layoutInfosRight: LayoutInfo[] = [];
    layoutInfos.forEach(layoutInfo => layoutInfo.left ? layoutInfosLeft.push(layoutInfo) : layoutInfosRight.push(layoutInfo));

    if (layoutInfosLeft.length > 0) computeOneSide(layoutInfosLeft, true);
    if (layoutInfosRight.length > 0) computeOneSide(layoutInfosRight, false);

    function computeOneSide(layoutInfosOneSide: LayoutInfo[], left: boolean) {
        const maxWidth = computeMaxLabelWidth(layoutInfosOneSide);
        layoutInfosOneSide.forEach(layoutInfo => {
            const controlPointsNum = layoutInfo.controlPoints.length;
            const middleControlPoint = layoutInfo.controlPoints[controlPointsNum - 1];
            const space = maxWidth - layoutInfo.labelBBox.width;
            layoutInfo.controlPoints.push({
                x: middleControlPoint.x + (left ? -space : 0),
                y: middleControlPoint.y,
            })
        });
    }
}

function dividedIntoLeftOrRight(layoutInfos: LayoutInfo[], cx: number, cy: number) {
    layoutInfos.forEach(layoutInfo => {
        layoutInfo.left = layoutInfo.x < cx;
    });
}

function computeLabelBBox(layoutInfos: LayoutInfo[]) {
    layoutInfos.forEach(layoutInfo => {
        const bbox = layoutInfo.labelBBox;
        const lastControlPoint = layoutInfo.controlPoints[layoutInfo.controlPoints.length-1];
        bbox.x = lastControlPoint.x + (layoutInfo.left ? -bbox.width : 0);
        bbox.y = lastControlPoint.y + (layoutInfo.labelBBox.height >> 1);
    });
}
