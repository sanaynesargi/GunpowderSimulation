class GunpowderSimulation {
  constructor(
    KNO3_ratio,
    charcoal_ratio,
    sulfur_ratio,
    total_particles,
    time_step = 0.001,
    total_time = 10,
    initial_temperature = 298.15,
    initial_pressure = 101325.0
  ) {
    this.KNO3_ratio = KNO3_ratio;
    this.charcoal_ratio = charcoal_ratio;
    this.sulfur_ratio = sulfur_ratio;
    this.time_step = time_step;
    this.total_time = total_time;
    this.initial_temperature = initial_temperature;
    this.initial_pressure = initial_pressure;

    // State variables
    this.time = 0;
    this.KNO3_concentration = this.KNO3_ratio;
    this.charcoal_concentration = this.charcoal_ratio;
    this.sulfur_concentration = this.sulfur_ratio;
    this.temperature = this.initial_temperature;
    this.pressure = this.initial_pressure;
    this.energy_release = 0;
    this.total_reactants_consumed = 0; // Track total consumed reactants

    // Constants
    this.R = 8.314; // Ideal gas constant in J/(mol*K)
    this.GRAVITY_FORCE = createVector(0, 0.1);

    // Particle Counts
    this.KNO3_particles = Math.floor(this.KNO3_concentration * total_particles);
    this.charcoal_particles = Math.floor(
      this.charcoal_concentration * total_particles
    );
    this.sulfur_particles = Math.floor(
      this.sulfur_concentration * total_particles
    );

    this.total_particles =
      this.KNO3_particles + this.charcoal_particles + this.sulfur_particles;

    // Force Factors affect the magnitudes of the forces that are applied
    this.TEMPERATURE_FORCE_FACTOR = 0.01 * 10;
    this.PRESSURE_FORCE_FACTOR = 0.1 * 0;
    this.BURN_RATE_FORCE_FACTOR = 0.05 * 10;

    // Tracking Variables
    this.burn_rate_tracking = {};
  }

  roundTo(n, digits) {
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

  // Method to step the simulation externally
  stepSimulation() {
    if (this.KNO3_particles <= 0 || this.charcoal_concentration <= 0 || this.sulfur_concentration <= 0) {
      console.log(this.burn_rate_tracking);
      return;
    }
    // Calculate reaction rates (simplified for demonstration)
    let KNO3_rate = -0.1 * this.KNO3_concentration;
    let charcoal_rate = -0.2 * this.charcoal_concentration;
    let sulfur_rate =
      this.sulfur_ratio === 0 ? 0 : -0.15 * this.sulfur_concentration;

    // Update concentrations
    this.KNO3_concentration += KNO3_rate * this.time_step;
    this.charcoal_concentration += charcoal_rate * this.time_step;
    this.sulfur_concentration += sulfur_rate * this.time_step;

    // Use previously updated concentrations to update current particle counts
    this.KNO3_particles = Math.floor(
      this.KNO3_concentration * this.total_particles
    );
    this.charcoal_particles = Math.floor(
      this.charcoal_concentration * this.total_particles
    );
    this.sulfur_particles = Math.floor(
      this.sulfur_concentration * this.total_particles
    );

    // Update total particle count
    this.total_particles =
      this.KNO3_particles + this.charcoal_particles + this.sulfur_particles;

    // Calculate temperature (simplified for demonstration)
    // Assuming energy released is directly proportional to the change in concentration of reactants
    this.energy_release =
      -(0.1 * KNO3_rate + 0.2 * charcoal_rate + 0.15 * sulfur_rate) *
      this.time_step;

    let delta_temperature =
      this.energy_release /
      (this.KNO3_ratio + this.charcoal_ratio + this.sulfur_ratio);
    this.temperature += delta_temperature;

    // Calculate pressure (simplified for demonstration)
    // Assuming ideal gas behavior and constant volume
    let n_total =
      this.KNO3_concentration +
      this.charcoal_concentration +
      this.sulfur_concentration; // Total moles of gas
    this.pressure = n_total * this.R * this.temperature;

    this.burn_rate =
      (this.total_reactants_consumed / (this.time / this.time_step)) * 100;

    this.burn_rate_tracking[this.time] = this.burn_rate;

    // Update time
    this.time += this.time_step;

    // Update total consumed reactants
    this.total_reactants_consumed += Math.abs(
      KNO3_rate + charcoal_rate + sulfur_rate
    );
  }

  retrieveParticleCounts() {
    return {
      KNO3: this.KNO3_particles,
      charcoal: this.charcoal_particles,
      sulfur: this.sulfur_particles,
      total: this.total_particles,
    };
  }

  calculateForces() {
    // Initialize total force as a zero vector
    let totalForce = createVector(0, 0);

    // If time is greater than 0, and the simulation is stepped, add forces
    if (this.time > 0) {
      let burn_rate =
        this.total_reactants_consumed / (this.time / this.time_step);
      let propulsionForce = createVector(
        0,
        burn_rate * this.BURN_RATE_FORCE_FACTOR
      );

      let deltaTemperature = this.temperature - this.initial_temperature;
      let temperatureForce = createVector(
        0,
        -deltaTemperature * this.TEMPERATURE_FORCE_FACTOR
      );

      let pressureForce = createVector(
        0,
        -this.pressure * this.PRESSURE_FORCE_FACTOR
      );

      // Add forces to totalForce
      totalForce.add(propulsionForce);
      totalForce.add(temperatureForce);
      totalForce.add(pressureForce);
    }

    return totalForce;
  }

  // Method to save the current state
  saveState() {
    return {
      time: this.time,
      KNO3_concentration: this.KNO3_concentration,
      charcoal_concentration: this.charcoal_concentration,
      sulfur_concentration: this.sulfur_concentration,
      temperature: this.temperature,
      pressure: this.pressure,
      energy_release: this.energy_release * pow(10, 5),
      burn_rate: this.burn_rate, // Calculate burn rate
    };
  }
}
