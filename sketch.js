let sim;
let result;
let particleCounts;
let stepButton;
let saveButton;
let particles = [];
let floorLineY;

let SIMULATION_STARTED = false;
let PARTICLE_COUNT = 750;
let SMALLNESS = 15;

// inputs
let KNO3Slider;
let charcoalSlider;
let sulfurSlider;

function setupParticles() {
  particles = [];
  SIMULATION_STARTED = false; // prevent immediate start

  // Initialize simulation
  sim = new GunpowderSimulation(0.5, 0.3, 0.2, PARTICLE_COUNT);

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
  let startX = (width - totalWidth) / 2 + 300;
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
      let radius = calculateRadius(molecule);
      let color = getParticleColor(molecule);
      let mass = getParticleMass(molecule);

      // Create the particle with adjusted radius, and add it to the array
      particles.push(new Particle(molecule, x, y, mass, radius, color)); // Multiply by 10 to scale for visualization

      // Break the loop if the desired number of particles is reached
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

function setup() {
  createCanvas(800, 600);
  background(223);

  // Create step button
  stepButton = createButton("Start/Pause Simulation");
  stepButton.position(10, height - 60);
  stepButton.mousePressed(() => (SIMULATION_STARTED = !SIMULATION_STARTED));

  // Create save button
  saveButton = createButton("Restart Simulation");
  saveButton.position(10, height - 30);
  saveButton.mousePressed(setupParticles);

  // Setup sliders to input composition
  KNO3Slider = createSlider(0, 255, 200);
  KNO3Slider.position(width - 130, 155);

  KNO3Slider = createSlider(0, 255, 200);
  KNO3Slider.position(width - 130, 155);

  KNO3Slider = createSlider(0, 255, 200);
  KNO3Slider.position(width - 130, 155);

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
  text("Time: " + result.time, 20, 40);
  text("KNO3 Concentration: " + result.KNO3_concentration, 20, 60);
  text("Charcoal Concentration: " + result.charcoal_concentration, 20, 80);
  text("Sulfur Concentration: " + result.sulfur_concentration, 20, 100);
  text("Temperature: " + result.temperature, 20, 120);
  text("Pressure: " + result.pressure, 20, 140);
  text("Burn Rate: " + result.burn_rate, 20, 160);
  text("Energy Release: " + result.energy_release, 20, 180);

  // Particle Counts
  text("KNO3 Particle Count: " + particleCounts.KNO3, 20, 220);
  text("Charcoal Particle Count: " + particleCounts.charcoal, 20, 240);
  text("Sulfur Particle Count: " + particleCounts.sulfur, 20, 260);

  text("Total Particle Count: " + particleCounts.total, 20, 300);
  text("Total Particles Displayed: " + particles.length, 20, 320);

  text("KNO3:", width - 130, 65);
  text("Charcoal:", width - 130, 85);
  text("Sulfur:", width - 130, 105);

  // Draw Legend Molecules
  fill(getParticleColor("KNO3")); // Use specified color
  ellipse(width - 40, 60, calculateRadius("KNO3"), calculateRadius("KNO3"));

  fill(getParticleColor("charcoal")); // Use specified color
  ellipse(
    width - 40,
    80,
    calculateRadius("charcoal", calculateRadius("charcoal"))
  );

  fill(getParticleColor("sulfur")); // Use specified color
  ellipse(
    width - 40,
    100,
    calculateRadius("sulfur"),
    calculateRadius("sulfur")
  );

  fill(0);
  rect(0, floorLineY, width, height - floorLineY); // Draw a black rectangle as the floor

  particles.forEach((particle) => {
    particle.update();
    particle.display();
  });

  if (SIMULATION_STARTED) {
    stepSimulation();
  }
}

function stepSimulation() {
  // Step through the simulation

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
