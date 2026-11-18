// Ändra fysikvärden och beräkningsmodellen här.
window.PROJECTILE_CONFIG = {
  gravity: 9.82,
  initialSpeed: 20,
  initialAngle: 45,
  speed: { min: 5, max: 40, step: 1 },
  angle: { min: 5, max: 85, step: 1 },
  animationSpeed: 1,
  trajectoryColors: ["#d45b52", "#249b83", "#875fc0", "#d18b25", "#4181c2", "#c64f91"]
};

// Kasthöjdens fysikmodell utan luftmotstånd.
window.ProjectilePhysics = {
  calculate: function (speed, angleDegrees, gravity) {
    const angle = angleDegrees * Math.PI / 180;
    const velocityX = speed * Math.cos(angle);
    const velocityY = speed * Math.sin(angle);
    const flightTime = 2 * velocityY / gravity;

    return {
      velocityX: velocityX,
      velocityY: velocityY,
      flightTime: flightTime,
      range: velocityX * flightTime,
      maxHeight: velocityY ** 2 / (2 * gravity),
      positionAt: function (time) {
        return {
          x: velocityX * time,
          y: velocityY * time - 0.5 * gravity * time ** 2
        };
      }
    };
  }
};
