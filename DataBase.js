
module.exports = class DataBase {
    constructor(tasks = []) {
        this.tasks = tasks;
        this.loadTasks;
    };

    get loadTasks() {
        try {
            const dataBuffer = fs.readFileSync('data.json');
            const dataJSON = dataBuffer.toString();
            this.tasks = JSON.parse(dataJSON);
        } catch (e) {
            this.tasks = [];
        };
    };

    get saveTasks() {
        const dataJSON = JSON.stringify(this.tasks);
        fs.writeFileSync('data.json', dataJSON);
    };

    get length() {
        return this.tasks.length;
    };

    addTask(task) {
        this.tasks.push(task);
        this.saveTasks();
    };

    getTaskByIndex(index) { 
        return this.tasks[index];
    };

    removeTaskByIndex(index) {
        this.tasks.splice(index, 1);
        this.saveTasks();
    };
}