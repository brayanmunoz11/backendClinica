function mergeSort(array) {
    if(array.length <= 1) {
        return array
    }


    const middle = Math.floor(array.length / 2);
    const left = array.slice(0, middle);
    const right = array.slice(middle);

    return merge(mergeSort(left), mergeSort(right))
}

function merge(left, right) {
    const array = [];

    while (left.length && right.length) {
        if(left[0]< right[0]) {
            array.push(left.shift());
        } else {
            array.push(right.shift());
        }
    }

    return array.concat(left.slice()).concat(right.slice());
}

function ordenarAsc(p_array_json, p_key) {
    p_array_json.sort(function (a, b) {
       return a[p_key] > b[p_key];
    });
 }

module.exports = ordenarAsc