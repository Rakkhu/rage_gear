
export const CONFIG = {
  MATCH_DURATION: 240, // seconds
  PHYSICS_RATE: 60,
  SERVER_TICK_RATE: 20, // Network snapshots per sec
  MAX_PLAYERS_PER_LOBBY: 12, // 3 squads x 2 teams x 2
  VEHICLE: {
    RADIUS: 1.5,
    SPEED: 30,
    BOOST_SPEED: 50,
    HP: 100,
    RAM_DAMAGE_FACTOR: 0.5
  },
  WEAPONS: {
    MG: { DAMAGE: 2, RATE: 100, RANGE: 100 },
    ROCKET: { DAMAGE: 35, RATE: 2500, RADIUS: 6, SPEED: 40 }
  },
  ZONE: {
    START_RADIUS: 60,
    END_RADIUS: 15,
    SHRINK_DURATION: 120,
    DAMAGE_PER_SEC: 5
  }
};

export const TEAMS = {
  RED: 'red',
  BLUE: 'blue'
};
