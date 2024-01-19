var roads = [
  "Alice's House-Bob's House", "Alice's House-Cabin",
  "Alice's House-Post Office", "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop", "Marketplace-Farm",
  "Marketplace-Post Office", "Marketplace-Shop",
  "Marketplace-Town Hall", "Shop-Town Hall"
];

function edges(roads) {
  let graph = Object.create(null);
  let roadFromTo = roads.map(r => r.split("-"));
  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }
  roadFromTo.forEach(([from, to]) => {
    addEdge(from, to);
    addEdge(to, from);
  });
  return graph;
}
let roadGraph = edges(roads);
class VillageState {
  constructor(place, percels) {
    this.place = place;
    this.percels = percels;
  }
  move(destination) {
    if (!edges(roads)[this.place].includes(destination)) {
      return this;
    } else {
      let percels = this.percels.map(p => {
        if (p.place != this.place) return p;
        return { place: destination, address: p.address };
      }).filter(p => p.place != p.address);
      // console.log(percels);
      return new VillageState(destination, percels);
    }
  }
}
function runRobot(state, robot, memory) {
  // console.log(state.percels);
  for (let turn = 0; ; turn++) {
    if (state.percels.length === 0) {
      console.log(`ends in ${turn} turns`);
      return turn;
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.destination);
    memory = action.memory;
    // console.log(`move to ${action.destination}`);
  }
}

function randomPick(list) {
  return list[Math.floor(Math.random() * list.length)];
}
function randomRobot(state, memory) {
  let destination = randomPick(edges(roads)[state.place]);
  return { destination, memory };
}

function routeRobot(state, memory) {
  if (memory.memory.length === 0) {
    memory.init();
  }
  let destination = memory.memory[0];
  memory.memory = memory.memory.slice(1);
  return { destination, memory };
}


function randomPercels(count = 5) {
  let result = [];
  for (let i = 0; i < count; i++) {
    let place = randomPick(Object.keys(edges(roads)));
    let address;
    do {
      address = randomPick(Object.keys(edges(roads)));
    } while (address === place);
    result.push({ place, address });
  }
  return result;
}


let firstState = new VillageState("Post Office", randomPercels(5));
// runRobot(firstState, randomRobot);


var mailRoute = [
  "Alice's House",
  "Cabin",
  "Alice's House",
  "Bob's House",
  "Town Hall",
  "Daria's House",
  "Ernie's House",
  "Grete's House",
  "Shop",
  "Grete's House",
  "Farm",
  "Marketplace",
  "Post Office"
];

let routeMem = {
  initVal: mailRoute,
  memory: mailRoute,
  init() {
    this.memory = this.initVal;
  }
}

// console.log(runRobot(firstState, routeRobot, routeMem));

function findRoute(graph, from, to) {
  let work = [{ at: from, route: [] }];
  for (let i = 0; i < work.length; i++) {
    let { at, route } = work[i];
    for (let place of graph[at]) {
      if (place === to) return route.concat(place);
      if (!work.some(w => w.at === place)) {
        work.push({ at: place, route: route.concat(place) });
      }
    } 
  }
}


function goalOrientedRobot({ place, percels }, route = []) {
  if (route.length === 0) {
    let percel = percels[0];
    if (percel.place !== place) {
      route = findRoute(edges(roads), place, percel.place);
    } else {
      route = findRoute(edges(roads), place, percel.address);
    }
  }
  return { destination: route[0], memory: route.slice(1) };
}



// runRobot(firstState, goalOrientedRobot);




let exPer = [
  { place: "Ernie's House", address: "Alice's House" },
  { place: "Alice's House", address: 'Post Office' },
  { place: "Post Office", address: "Grete's House" },
  { place: "Post Office", address: "Shop"},
];


function getStep(ghaph, from, to) {
  if (to == undefined) {
    return Infinity;
  } else if (from == to) {
    return 0;
  }
  else {
    return findRoute(ghaph, from, to).length;
  }
}

function findNearPlaceToGo(graph, from, percels) {
  let min = Object.create(null);
  let nearToAccept = Object.create(null);
  let nearToDeliver = Object.create(null);
  for (let p of percels) {
    if (from !== p.place) {
      if (getStep(edges(roads), from, p.place) < getStep(edges(roads), from, nearToAccept.place)) {
        nearToAccept = p;
      }
    } else {
      if (getStep(edges(roads), from, p.address) < getStep(edges(roads), from, nearToDeliver.address)) {
        nearToDeliver = p;
      }
    }
  }
  return min = getStep(edges(roads), from, nearToAccept.place) <= getStep(edges(roads), from, nearToDeliver.address) ? nearToAccept : nearToDeliver;
}


function goalOrientedRobotVol2({ place, percels }, route = []) {
  if (route.length === 0) {
    let nearTogo = findNearPlaceToGo(edges(roads), place, percels);
    if (nearTogo.place !== place) {
      route = findRoute(edges(roads), place, nearTogo.place);
    } else {
      route = findRoute(edges(roads), place, nearTogo.address);
    }
  }
  return { destination: route[0], memory: route.slice(1) };
}

runRobot(firstState, goalOrientedRobotVol2);

let experimentalState = new VillageState("Post Office", exPer);

function compareRobots(...robots) {
  let result = {
    robot1: 0,
    robot2: 0,
  };
  // for (let robot of robots) {
  //   let turn = runRobot(state, robot.name, robot.memory);
  //   result.push(`${robot.name.name} ends in ${turn} turns (${turn / state.percels.length} turns par percel)`);
  // }

  for (let i = 0; i < 1000 ; i++) {
    let state = new VillageState("Post Office",randomPercels());
    let robot1 = runRobot(state,robots[0].name);
    let robot2 = runRobot(state,robots[1].name);
    if (robot1 < robot2) {
      result.robot1++;
    } else {
      result.robot2++;
    }
  }
  return result;
}

let robots = [
  {
    name: goalOrientedRobot,
  },
  {
    name: goalOrientedRobotVol2,
  }
]
// let compareResult = compareRobots(...robots);
// 

// parmanent group

let set = new Set();
/*
console.log(set);
set.add(1);
console.log(set);

console.log(set);
console.log(set);
*/