const { Worker } = require("worker_threads");
const os = require("os");

console.log("Total cores", os.cpus().length);

const jobs = Array.from({ length: 100 }, () => 1e9);

// const tick = performance.now();

// for (let job of jobs) {
//   let count = 0;
//   for (let i = 0; i < job; i++) {
//     count++;
//   }
// }

// const tock = performance.now();

// console.log(`Main thread took ${tock - tick} ms`);

function chunkify(array, n) {
  let chunks = [];
  for (let i = n; i > 0; i--) {
    chunks.push(array.splice(0, Math.ceil(array.length / i)));
  }
  return chunks;
}

function run(jobs, concurrentWorkers) {
  const chunks = chunkify(jobs, concurrentWorkers);

  const tick = performance.now();
  let completedWorkers = 0;

  chunks.forEach((data, i) => {
    const worker = new Worker("./worker.js");
    worker.postMessage(data);
    worker.on("message", () => {
      console.log(`Worker ${i} completed`);
      completedWorkers++;
      if (completedWorkers === concurrentWorkers) {
        const tock = performance.now();
        console.log(`${concurrentWorkers} workers took ${tock - tick} ms`);
        process.exit();
      }
    });
  });
}

run(jobs, 8);
