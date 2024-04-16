// Particle class definition
class Particle {
  constructor(type, x, y, mass, radius, color) {
    this.type = type;
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = mass;
    this.radius = radius;
    this.color = color;
  }

  applyGravity() {
    // Gravitational acceleration constant (approximate value on Earth's surface)
    let g = 0.0002; // in m/s^2

    // Calculate gravitational force
    let gravitationalForce = createVector(0, this.mass * g);

    // Apply gravitational force to the particle
    this.applyForce(gravitationalForce);
  }

  // Apply force to the particle (Newton's second law)
  applyForce(force) {
    let f = p5.Vector.div(force, this.mass); // F = ma => a = F/m
    this.acceleration.add(f);
  }

  // Update particle's position based on forces
  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  // Display the particle
  display() {
    fill(this.color); // Use specified color
    ellipse(this.position.x, this.position.y, this.radius, this.radius);
  }

  collide(other) {
    // Check if both particles have zero velocity
    // if (this.velocity.mag() === 0 && other.velocity.mag() === 0) {
    //   return; // No need to process collision if both particles are stationary
    // }

    let distance = dist(
      this.position.x,
      this.position.y,
      other.position.x,
      other.position.y
    );
    let minDistance = this.radius + other.radius;
    if (distance < minDistance) {
      // Calculate overlap distance
      let overlap = minDistance - distance;

      // Calculate the direction of collision
      let collisionNormal = p5.Vector.sub(this.position, other.position);
      collisionNormal.normalize();

      // Separate the particles along the collision normal
      let thisDisplacement = p5.Vector.mult(collisionNormal, overlap / 2);
      let otherDisplacement = p5.Vector.mult(collisionNormal, -overlap / 2);
      this.position.add(thisDisplacement);
      other.position.add(otherDisplacement);

      // Calculate the relative velocity
      let relativeVelocity = p5.Vector.sub(this.velocity, other.velocity);

      // Calculate the relative velocity along the collision normal
      let velAlongNormal = p5.Vector.dot(relativeVelocity, collisionNormal);

      // If the particles are moving towards each other
      if (velAlongNormal < 0) {
        // Calculate restitution (bounce) coefficient
        let restitution = 0.8; // Adjust as needed

        // Calculate impulse magnitude
        let impulseMag = -(1 + restitution) * velAlongNormal;
        impulseMag /= 1 / this.mass + 1 / other.mass;

        // Apply impulse
        let impulse = p5.Vector.mult(collisionNormal, impulseMag);
        this.velocity.add(p5.Vector.div(impulse, this.mass));
        other.velocity.sub(p5.Vector.div(impulse, other.mass));
      }
    }
  }
}
