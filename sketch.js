let sim;
let result;
let particleCounts;
let stepButton;
let saveButton;
let setupButton;
let particles = [];
let floorLineY;

let SIMULATION_STARTED = false;
let PARTICLE_COUNT = 350;
let SMALLNESS = 15;

// Inputs
let KNO3Slider;
let charcoalSlider;
let sulfurSlider;

// Input values
let KNO3Concentation;
let charcoalConcentration;
let sulfurConcentration;

function roundTo(n, digits) {
  var negative = false;
  if (digits === undefined) {
    digits = 0;
  }
  if (n < 0) {
    negative = true;
    n = n * -1;
  }
  var multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  n = (Math.round(n) / multiplicator).toFixed(digits);
  if (negative) {
    n = (n * -1).toFixed(digits);
  }
  return n;
}

function setupParticles() {
  particles = [];
  SIMULATION_STARTED = false; // prevent immediate start

  // Initialize simulation
  sim = new GunpowderSimulation(
    KNO3Concentation,
    charcoalConcentration,
    sulfurConcentration,
    PARTICLE_COUNT
  );

  // Run initial simulation
  result = sim.saveState();
  particleCounts = sim.retrieveParticleCounts();

  // Desired total number of particles
  let desiredTotalParticles = sim.total_particles;

  // Calculate the number of particles per row/column
  let particlesPerRow = Math.ceil(Math.sqrt(desiredTotalParticles));

  // Calculate the width and height of each particle
  let particleWidth = width / particlesPerRow;
  let particleHeight = height / particlesPerRow;

  // Calculate the y-coordinate of the bottom of the square
  floorLineY = height * 0.9;
  let bottomY = floorLineY + 10;

  // Calculate the y-coordinate of the top of the square
  let topY = bottomY - particleHeight * particlesPerRow + 60;

  // Calculate the total width of the mini cube
  let totalWidth = particlesPerRow * particleWidth;

  // Calculate the starting x-coordinate to center the mini cube
  let startX = (width - totalWidth) / 2 + 550;
  let index = 0;

  // Loop through each row
  for (let row = 0; row < particlesPerRow; row++) {
    // Calculate the y-coordinate of the row
    let y = bottomY - row * 3 - particleHeight / 2;

    // Loop through each column
    for (let col = 0; col < particlesPerRow; col++) {
      // Calculate the x-coordinate of the column
      let x = startX + col * 3 + particleWidth / 2;

      // Determine molecule type based on the number of particles for each type
      let molecule;
      if (index < sim.KNO3_particles) {
        molecule = "KNO3"; // Potassium Nitrate
      } else if (index < sim.KNO3_particles + sim.charcoal_particles) {
        molecule = "charcoal"; // Charcoal
      } else {
        molecule = "sulfur"; // Sulfur
      }

      // Get the radius based on the molecule
      let radius = calculateRadius(molecule) * 1.5;
      let color = getParticleColor(molecule);
      let mass = getParticleMass(molecule);

      // Create the particle with adjusted radius, and add it to the array
      particles.push(new Particle(molecule, x, y, mass, radius, color)); // Multiply by 10 to scale for visualization

      // Break the loop if the desir ed number of particles is reached
      if (particles.length >= desiredTotalParticles) {
        break;
      }

      index++;
    }

    // Break the loop if the desired number of particles is reached
    if (particles.length >= desiredTotalParticles) {
      break;
    }
  }
}

function toggleSimState() {
  let totalConcentration = roundTo(
    KNO3Concentation + charcoalConcentration + sulfurConcentration,
    2
  );

  if (totalConcentration != 1) {
    alert("Concentrations must sum to 1");
    SIMULATION_STARTED = false;
    return;
  }

  SIMULATION_STARTED = !SIMULATION_STARTED;
}

function setup() {
  createCanvas(1200, 600);
  background(223);

  // Create step button
  stepButton = createButton("Start/Pause Simulation");
  stepButton.position(10, height - 47);
  stepButton.mousePressed(() => toggleSimState());

  // Create save button
  saveButton = createButton("Restart Simulation");
  saveButton.position(10, height - 20);
  saveButton.mousePressed(setupParticles);

  setupButton = createButton("Construct Simulation");
  setupButton.position(140, height - 20);
  setupButton.mousePressed(setupParticles);

  // Setup sliders to input composition
  KNO3Slider = createSlider(0, 255, 200);
  KNO3Slider.position(width - 150, 155);

  charcoalSlider = createSlider(0, 255, 200);
  charcoalSlider.position(width - 150, 195);

  sulfurSlider = createSlider(0, 255, 200);
  sulfurSlider.position(width - 150, 235);

  // setup particles
  setupParticles();
}

function draw() {
  background(35, 35, 75);

  // Display simulation results or further analysis
  // You can modify this part to display the simulation results
  // For example, you can draw graphs or display text
  textSize(16);
  textAlign(LEFT);
  fill(200, 200, 255);

  // General Simulation Information
  text("Time: " + result.time.toFixed(4), 20, 40);
  text(
    "KNO3 Concentration: " +
      (result.KNO3_concentration
        ? result.KNO3_concentration.toFixed(3)
        : "Waiting for Input"),
    20,
    60
  );
  text(
    "Charcoal Concentration: " +
      (result.charcoal_concentration
        ? result.charcoal_concentration.toFixed(3)
        : "Waiting for Input"),
    20,
    80
  );
  text(
    "Sulfur Concentration: " +
      (result.sulfur_concentration
        ? result.sulfur_concentration.toFixed(3)
        : "Waiting for Input"),
    20,
    100
  );
  text("Temperature: " + result.temperature.toFixed(3) + " K", 20, 120);
  text("Pressure: " + result.pressure.toFixed(3) + " Pa", 20, 140);
  text(
    "Burn Rate: " +
      (result.burn_rate
        ? result.burn_rate.toFixed(3) + " ptcl/ts"
        : "0 ptcl/ts"),
    20,
    160
  );
  text("Energy Release: " + result.energy_release.toFixed(3) + " gJ", 20, 180);

  // Particle Counts
  text("KNO3 Particle Count: " + particleCounts.KNO3, 20, 220);
  text("Charcoal Particle Count: " + particleCounts.charcoal, 20, 240);
  text("Sulfur Particle Count: " + particleCounts.sulfur, 20, 260);

  text("Total Particle Count: " + particleCounts.total.toFixed(3), 20, 300);
  text("Total Particles Displayed: " + particles.length, 20, 320);

  text("KNO3:", width - 155, 65);
  text("Charcoal:", width - 155, 85);
  text("Sulfur:", width - 155, 105);

  // Draw Legend Molecules
  drawLegend();

  // Draw Slider Info Text
  fill(200, 200, 255);
  text(
    "KNO3: " +
      `${roundTo(KNO3Concentation, 2)} (${Math.floor(
        roundTo(KNO3Concentation, 2) * 100
      )}%)`,
    width - 155,
    145
  );

  text(
    "Charcoal: " +
      `${roundTo(charcoalConcentration, 2)} (${Math.floor(
        roundTo(charcoalConcentration, 2) * 100
      )}%)`,
    width - 155,
    185
  );
  text(
    "Sulfur: " +
      `${roundTo(sulfurConcentration, 2)} (${Math.floor(
        roundTo(sulfurConcentration, 2) * 100
      )}%)`,
    width - 155,
    225
  );

  text(
    "Total (=1): " +
      `${roundTo(
        KNO3Concentation + charcoalConcentration + sulfurConcentration,
        2
      )}`,
    width - 155,
    265
  );

  updateSliderValues();

  if (SIMULATION_STARTED) {
    stepSimulation();
  }
}

function updateSliderValues() {
  KNO3Concentation = map(KNO3Slider.value(), 0, 255, 0, 1);
  charcoalConcentration = map(charcoalSlider.value(), 0, 255, 0, 1);
  sulfurConcentration = map(sulfurSlider.value(), 0, 255, 0, 1);
}

function drawLegend() {
  let radiusMultipier = 3;

  fill(getParticleColor("KNO3")); // Use specified color
  ellipse(
    width - 40,
    60,
    calculateRadius("KNO3") * radiusMultipier,
    calculateRadius("KNO3") * radiusMultipier
  );

  fill(getParticleColor("charcoal")); // Use specified color
  ellipse(
    width - 40,
    80,
    calculateRadius("charcoal") * radiusMultipier,
    calculateRadius("charcoal") * radiusMultipier
  );

  fill(getParticleColor("sulfur")); // Use specified color
  ellipse(
    width - 40,
    100,
    calculateRadius("sulfur") * radiusMultipier,
    calculateRadius("sulfur") * radiusMultipier
  );

  fill(0);
  rect(0, floorLineY, width, height - floorLineY); // Draw a black rectangle as the floor

  particles.forEach((particle) => {
    particle.update();
    particle.display();
  });
}

function stepSimulation() {
  // Step through the simulation
  let totalConcentration = roundTo(
    KNO3Concentation + charcoalConcentration + sulfurConcentration,
    2
  );

  if (totalConcentration != 1) {
    alert("Concentrations must sum to 1");
    SIMULATION_STARTED = false;
    return;
  }

  sim.stepSimulation();
  result = sim.saveState();
  particleCounts = sim.retrieveParticleCounts();

  deleteParticles();

  let forces = sim.calculateForces();

  // Apply forces to particles
  particles.forEach((particle) => {
    particle.applyForce(forces);
    particle.applyGravity();
    particle.update();
    particle.display();
  });

  // Check for collisions
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      particles[i].collide(particles[j]);
    }
  }
}

function deleteParticles() {
  let KNO3_particles_deleted = particleCounts.KNO3;
  let charcoal_particles_deleted = particleCounts.charcoal;
  let sulfur_particles_deleted = particleCounts.sulfur;

  let keep_marked = [];

  let a = 0;
  let b = 0;
  let c = 0;

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];

    if (particle.type == "KNO3" && a < KNO3_particles_deleted) {
      keep_marked.push(particle);
      a++;
    }
    if (particle.type == "charcoal" && b < charcoal_particles_deleted) {
      keep_marked.push(particle);
      b++;
    }
    if (particle.type == "sulfur" && c < sulfur_particles_deleted) {
      keep_marked.push(particle);
      c++;
    }
  }

  particles = keep_marked;
}

function saveState() {
  // Save the current state of the simulation
  result = sim.saveState();
}

// Function to calculate the effective radius based on the molecule
function calculateRadius(molecule) {
  switch (molecule) {
    case "KNO3": // Potassium Nitrate
      return 0.4 * SMALLNESS; // Estimated radius in nanometers
    case "charcoal":
      return 0.2 * SMALLNESS; // Estimated radius in nanometers
    case "sulfur":
      return 0.4 * SMALLNESS; // Estimated radius in nanometers
    default:
      return 0.1 * SMALLNESS; // Default radius if molecule is unknown
  }
}

function getParticleMass(molecule) {
  switch (molecule) {
    case "KNO3": // Potassium Nitrate
      return 101.1; // Molecular mass in g/mol
    case "charcoal":
      return 12.01; // Molecular mass in g/mol
    case "sulfur":
      return 32.07; // Molecular mass in g/mol
    default:
      return 1; // Default mass if molecule is unknown
  }
}

function getParticleColor(molecule) {
  let sulfurColor = color(255, 255, 0); // Yellow
  let KNO3Color = color(255, 0, 0); // Red
  let charcoalColor = color(0); // Black

  switch (molecule) {
    case "KNO3": // Potassium Nitrate
      return KNO3Color; // Estimated color in nanometers
    case "charcoal":
      return charcoalColor; // Estimated color in nanometers
    case "sulfur":
      return sulfurColor; // Estimated color in nanometers
    default:
      return color(232);
  }
}
