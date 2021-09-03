function binarysearch (arr, x, start, end) {
    if (start > end) return false;
    let mid=Math.floor((start + end)/2);
    if (arr[mid].nombre === x) return arr[mid];     
    if(arr[mid].nombre > x)
        return binarysearch(arr, x, start, mid-1);
    else
        return binarysearch(arr, x, mid+1, end);
}

module.exports = binarysearch