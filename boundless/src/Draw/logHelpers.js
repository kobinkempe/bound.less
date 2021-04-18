


export function printRect(rect){
    return "{Left:"+rect.left+", Bottom:"+rect.bottom+", Right:"+rect.right+", Top:"+rect.top+"}"
}

export function domToString (domEl, numOfGroups) {
    let whitelist = domEl.children;
    var obj = {};
    function domToObj (dum) {
        for (let i = 0; i < whitelist.length; ++i) {
            if (dum[whitelist[i]] instanceof NodeList) {
                obj[whitelist[i]] = Array.from(dum[whitelist[i]]);
            } else {
                obj[whitelist[i]] = dum[whitelist[i]];
            }
        }
        return obj;
    }
    JSON.stringify(domEl, function (name, value) {
        if (name === "") {
            return domToObj(value);
        }
        if (Array.isArray(this)) {
            if (typeof value === "object") {
                return domToObj(value);
            }
            return value;
        }
        if (whitelist.find(x => (x === name)))
            return value;
    });
    return JSON.stringify(obj, ['two-0', 'two-1', ''])
}
