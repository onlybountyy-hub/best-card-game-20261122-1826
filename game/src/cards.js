// Card catalogue for Ember Pact. Each card: id, name, cost, type, icon, text,
// and an effect descriptor the engine interprets (damage / armor / heal / draw / burn / mana).
export const CARDS = {
  strike:   { id: 'strike',   name: 'Ember Strike', cost: 1, type: 'attack',  icon: '✦', text: 'Deal 3 damage.', damage: 3 },
  heavy:    { id: 'heavy',    name: 'Heavy Blow',   cost: 3, type: 'attack',  icon: '✦', text: 'Deal 6 damage.', damage: 6 },
  fireball: { id: 'fireball', name: 'Fireball',     cost: 4, type: 'attack',  icon: '✦', text: 'Deal 8 damage.', damage: 8 },
  twin:     { id: 'twin',     name: 'Twin Sparks',  cost: 2, type: 'attack',  icon: '✦', text: 'Deal 2 damage, twice.', damage: 2, hits: 2 },
  meteor:   { id: 'meteor',   name: 'Meteor Fall',  cost: 5, type: 'attack',  icon: '✦', text: 'Deal 10 damage.', damage: 10 },
  frost:    { id: 'frost',    name: 'Frost Shard',  cost: 2, type: 'attack',  icon: '✦', text: 'Deal 4 damage.', damage: 4 },
  guard:    { id: 'guard',    name: 'Cinder Guard', cost: 2, type: 'guard',   icon: '⬢', text: 'Gain 6 armor.', armor: 6 },
  wall:     { id: 'wall',     name: 'Stone Wall',   cost: 1, type: 'guard',   icon: '⬢', text: 'Gain 4 armor.', armor: 4 },
  mend:     { id: 'mend',     name: 'Mending Flame',cost: 2, type: 'heal',    icon: '✚', text: 'Restore 5 health.', heal: 5 },
  leech:    { id: 'leech',    name: 'Soul Leech',   cost: 2, type: 'heal',    icon: '✚', text: 'Deal 3, heal 2.', damage: 3, heal: 2 },
  drain:    { id: 'drain',    name: 'Soul Drain',   cost: 3, type: 'heal',    icon: '✚', text: 'Deal 4, heal 3.', damage: 4, heal: 3 },
  draw:     { id: 'draw',     name: 'Quick Draw',   cost: 1, type: 'utility', icon: '▤', text: 'Draw 2 cards.', draw: 2 },
  rally:    { id: 'rally',    name: 'Rally Cry',    cost: 2, type: 'utility', icon: '▤', text: 'Gain 2 mana now.', mana: 2 },
  ignite:   { id: 'ignite',   name: 'Ignite',       cost: 2, type: 'utility', icon: '▤', text: 'Deal 2, burn 2 for 2 turns.', damage: 2, burn: 2, burnTurns: 2 },
};

// The 20-card deck every duelist shuffles: two copies of the workhorses, one Meteor.
export const DECK_LIST = [
  'strike', 'strike', 'heavy', 'fireball', 'twin', 'twin', 'meteor', 'frost', 'frost',
  'guard', 'guard', 'wall', 'wall', 'mend', 'mend', 'leech', 'drain', 'draw', 'draw',
  'rally', 'ignite',
];

export function buildDeck() {
  return DECK_LIST.slice();
}
