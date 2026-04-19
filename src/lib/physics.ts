/**
 * AeroPET Pro Extreme - Physics Engine
 * Refined for realistic parabolic trajectories and advanced thermodynamics.
 */

export interface SimulationResult {
  trajectory: { x: number; y: number; t: number }[];
  maxHeight: number;
  maxDistance: number;
  maxVelocity: number;
  phases: { startTime: number; endTime: number; label: string }[];
}

// Constants
const G = 9.80665;
const RHO_WATER = 998.0;
const RHO_AIR_STP = 1.225;
const P_ATM = 101325.0; // Pa
const GAMMA = 1.4; // Adiabatic index for air
const R_AIR = 287.05; // J/(kg*K)
const T0 = 293.15; // Starting temperature (20°C)

export interface RocketParams {
  waterVolumeMl: number;
  pressurePsi: number;
  angleDeg: number;
  bottleVolumeL: number;
  nozzleDiameterMm: number;
  bottleDiameterMm: number;
  dryMassKg: number;
  dragCoeff: number;
}

export function simulateRocket(params: RocketParams): SimulationResult {
  const {
    waterVolumeMl,
    pressurePsi,
    angleDeg,
    bottleVolumeL,
    nozzleDiameterMm,
    bottleDiameterMm,
    dryMassKg,
    dragCoeff,
  } = params;

  // Convert units
  const theta = (angleDeg * Math.PI) / 180;
  const p0Abs = pressurePsi * 6894.76 + P_ATM;
  const vBottle = bottleVolumeL / 1000;
  const vWater0 = waterVolumeMl / 1e6;
  const vAir0 = vBottle - vWater0;
  const aNozzle = Math.PI * Math.pow(nozzleDiameterMm / 2000, 2);
  const aBottle = Math.PI * Math.pow(bottleDiameterMm / 2000, 2);

  // Initial state: [x, y, vx, vy, vWater, pAir, mAir]
  // We keep track of air mass because it changes in pneumatic phase
  const mAir0 = (p0Abs * vAir0) / (R_AIR * T0);
  let state = [0, 0, 0, 0, vWater0, p0Abs, mAir0];
  
  const trajectory: { x: number; y: number; t: number }[] = [];
  const phases: { startTime: number; endTime: number; label: string }[] = [];
  
  let t = 0;
  let dt = 0.002; // Fine step for precision
  let maxHeight = 0;
  let maxVelocity = 0;
  
  let currentPhase: 'Hydraulic' | 'Pneumatic' | 'Ballistic' | null = null;
  let phaseStart = 0;

  function getDerivatives(s: number[]): number[] {
    const [x, y, vx, vy, vWater, pAir, mAir] = s;
    const speed = Math.sqrt(vx * vx + vy * vy);
    
    // Dynamic mass
    const currentMass = dryMassKg + vWater * RHO_WATER + mAir;
    
    let thrust = 0;
    let dVWater = 0;
    let dPAir = 0;
    let dMAir = 0;

    if (vWater > 0) {
      // Phase 1: Hydraulic
      if (currentPhase !== 'Hydraulic') {
        if (currentPhase) phases.push({ startTime: phaseStart, endTime: t, label: currentPhase });
        currentPhase = 'Hydraulic';
        phaseStart = t;
      }
      
      const vAir = vBottle - vWater;
      const pCurr = p0Abs * Math.pow(vAir0 / vAir, GAMMA);
      const pDiff = Math.max(0, pCurr - P_ATM);
      
      // Discharge coefficient trick (0.98 for smooth nozzle)
      const ve = 0.98 * Math.sqrt((2 * pDiff) / RHO_WATER);
      const mDot = RHO_WATER * aNozzle * ve;
      
      thrust = mDot * ve + (pCurr - P_ATM) * aNozzle;
      dVWater = -aNozzle * ve;
      // pAir and mAir stay relatively constant in purely hydraulic model (adiabatic expansion handled by vAir change)
    } else if (pAir > P_ATM) {
      // Phase 2: Pneumatic
      if (currentPhase !== 'Pneumatic') {
        if (currentPhase) phases.push({ startTime: phaseStart, endTime: t, label: currentPhase });
        currentPhase = 'Pneumatic';
        phaseStart = t;
      }

      const temp = pAir / (mAir * R_AIR / vBottle);
      const pRatio = pAir / P_ATM;
      const crit = Math.pow((GAMMA + 1) / 2, GAMMA / (GAMMA - 1));

      let mDot = 0;
      let ve = 0;

      if (pRatio > crit) {
        // Choked flow
        ve = Math.sqrt(GAMMA * R_AIR * temp * (2 / (GAMMA + 1)));
        const rhoE = (pAir / (R_AIR * temp)) * Math.pow(2 / (GAMMA + 1), (GAMMA + 1) / (2 * (GAMMA - 1)));
        mDot = rhoE * aNozzle * ve;
        thrust = mDot * ve + (pAir * Math.pow(2 / (GAMMA + 1), GAMMA / (GAMMA - 1)) - P_ATM) * aNozzle;
      } else {
        // Subsonic flow
        ve = Math.sqrt((2 * GAMMA * R_AIR * temp) / (GAMMA - 1) * (1 - Math.pow(P_ATM / pAir, (GAMMA - 1) / GAMMA)));
        const rhoE = P_ATM / (R_AIR * temp * Math.pow(P_ATM / pAir, 1 / GAMMA));
        mDot = rhoE * aNozzle * ve;
        thrust = mDot * ve;
      }
      
      dMAir = -mDot;
      // Adiabatic p_dot calculation
      dPAir = -(pAir * GAMMA * mDot) / (mAir);
    } else {
      // Phase 3: Ballistic
      if (currentPhase !== 'Ballistic') {
        if (currentPhase) phases.push({ startTime: phaseStart, endTime: t, label: currentPhase });
        currentPhase = 'Ballistic';
        phaseStart = t;
      }
    }

    // Launch rail constraint: first 1m or so, the rocket stays on rail
    const distFromStart = Math.sqrt(x * x + y * y);
    const flightAngle = distFromStart < 1.0 ? theta : (speed > 0.5 ? Math.atan2(vy, vx) : theta);

    // Aerodynamic Drag
    const dragForce = 0.5 * RHO_AIR_STP * speed * speed * dragCoeff * aBottle;
    
    // Components
    const ax = (thrust * Math.cos(flightAngle) - (speed > 0.1 ? (vx / speed) * dragForce : 0)) / currentMass;
    const ay = (thrust * Math.sin(flightAngle) - (speed > 0.1 ? (vy / speed) * dragForce : 0) - currentMass * G) / currentMass;

    return [vx, vy, ax, ay, dVWater, dPAir, dMAir];
  }

  // Integration Loop (RK4)
  while (state[1] >= -0.01 && t < 20) {
    if (t === 0 || Math.floor(t * 1000) % 10 === 0) {
      trajectory.push({ x: state[0], y: Math.max(0, state[1]), t });
    }

    const k1 = getDerivatives(state);
    const k2 = getDerivatives(state.map((v, i) => v + k1[i] * dt * 0.5));
    const k3 = getDerivatives(state.map((v, i) => v + k2[i] * dt * 0.5));
    const k4 = getDerivatives(state.map((v, i) => v + k3[i] * dt));

    state = state.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    
    t += dt;
    maxHeight = Math.max(maxHeight, state[1]);
    maxVelocity = Math.max(maxVelocity, Math.sqrt(state[2] * state[2] + state[3] * state[3]));

    // Cap the distance to avoid infinite loops if parameters are broken
    if (state[0] > 1000) break;
  }

  // Final phase close
  if (currentPhase) phases.push({ startTime: phaseStart, endTime: t, label: currentPhase });

  return {
    trajectory,
    maxHeight,
    maxDistance: state[0],
    maxVelocity,
    phases
  };
}
