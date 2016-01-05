const pendingTasks = [];

export function job (task, args) {
    pendingTasks.push({
        fn: task,
        args
    });
}

export function run () {
    return new Promise(resolve => {
        if (pendingTasks.length) {
            runNext();
        } else {
            resolve();
        }
    });
}

function runNext () {
    console.log('running a task');
    Promise.resolve(pendingTasks.shift())
    .then(task => {
        return task.fn.apply(null, task.args);
    })
    .catch(() => {})
    .then(() => run());
}
