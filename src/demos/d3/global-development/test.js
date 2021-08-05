// score代表着比例
const interYear = isActive 
    ? (
        min(
            maxYear, 
            currentYear + 5, 
            max(
                minYear, 
                currentYear - 5, 
                prevScore > nextScore 
                    ? (currentYear - 2.5 * prevScore / sqrt(pow(pX - tX, 2) + pow(pY - tY, 2))) // 2.5 * prevScore / prev区间长度
                    : (currentYear + 2.5 * nextScore / sqrt(pow(nX - tX, 2) + pow(nY - tY, 2)))
                )
        )
    ) 
    : interYear;

// 先比较prev-this和this-next两个区域的score, 再根据dist选择最近的端点.
const currentYear = isActive 
    ? (
        min(
            maxYear, 
            max(minYear, 
                prevScore > nextScore 
                    ? (thisDist < prevDist 
                        ? currentYear 
                        : currentYear-5
                    ) 
                    : (thisDist < nextDist 
                        ? currentYear 
                        : currentYear+5
                    )
            )
        )
    ) : currentYear