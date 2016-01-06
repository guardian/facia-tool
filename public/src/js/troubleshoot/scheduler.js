export default function () {
    const pendingTasks = [];

    function job (task, args) {
        pendingTasks.push({
            fn: task,
            args
        });
    }

    function run () {
        return new Promise(iterate);
    }

    function iterate (resolve) {
        if (pendingTasks.length) {
            runNext(resolve);
        } else {
            resolve();
        }
    }

    function runNext (resolve) {
        Promise.resolve(pendingTasks.shift())
        .then(task => {
            return task.fn.apply(null, task.args);
        })
        .catch(() => {})
        .then(() => iterate(resolve));
    }

    return {job, run};
}
