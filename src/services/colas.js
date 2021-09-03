class Queue{
    constructor(){
        this.items = {};
        this.front = 0;
        this.end = 0;

    };
    enqueue(data){
        this.items[this.end]= data;
        this.end ++;
    }
}

module.exports = Queue;