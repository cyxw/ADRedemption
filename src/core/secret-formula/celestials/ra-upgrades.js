import { DC } from "../../constants";
import { Currency } from "../../currency";

const formatCost = c => format(c, 2);

const rebuyable = config => {
  return {
    id: config.id,
    celestial: config.celestial,
    description: config.description,
    cost: () => getHybridCostScaling(
      player.celestials.ra.rebuyables[config.intId],
      0,
      config.baseCost,
      10,
      (90 * 10 ** player.celestials.ra.rebuyables[config.intId]), // This is dumb. Very dumb. I know. Its also very easy, and does what i want. Shut up.
      DC.E333,
      10,
      10 //Yes the exponential and linear here are the same. Thats on purpose, this code is easier to use for just exponential (weirdly) so thats what im doing.
    ),
    formatCost,
    effect: 0,
    formatEffect: () => ("hi"),
    currency: Currency.mendingPoints,
    currencyLabel: config.currencyLabel,
    rebuyable: true,
    implemented: config.baseCost > 0
  }
}

export const raUpgrades = {
  weakenTeresaScaling: rebuyable({
    id: "weakenTeresaScaling",
    intId: 0,
    celestial: "teresa",
    description: () => `Weaken Teresa's level cost by ${formatX(10)} (before exponents)`,
    baseCost: 1e7,
    currency: () => Currency.antimatter,//temporary, have to decide what we're gonna use (Fn its MvR for all, defined above and in ra-upgrades.js (the other one))
    currencyLabel: "NYI",
  }),
  weakenEffarigScaling: rebuyable({
    id: "weakenEffarigScaling",
    intId: 1,
    celestial: "effarig",
    description: () => `Weaken Effarig's level cost by ${formatX(10)} (before exponents)`,
    baseCost: 1e7,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
  }),
  weakenEnslavedScaling: rebuyable({
    id: "weakenEnslavedScaling",
    intId: 2,
    celestial: "enslaved",
    description: () => `Weaken Nameless' level cost by ${formatX(10)} (before exponents)`,
    baseCost: 1e7,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
  }),
  weakenVScaling: rebuyable({
    id: "weakenVScaling",
    intId: 3,
    celestial: "v",
    description: () => `Weaken V's level cost by ${formatX(10)} (before exponents)`,
    baseCost: 1e7,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
  }),
  weakenRaScaling: rebuyable({
    id: "weakenRaScaling",
    intId: 4,
    celestial: "ra",
    description: () => `Weaken Ra's level cost by ${formatX(10)} (before exponents)`,
    baseCost: 1e7,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
  }),
  weakenLaitelaScaling: rebuyable({
    id: "weakenLaitelaScaling",
    intId: 5,
    celestial: "laitela",
    description: () => `Weaken Laitela's level cost by ${formatX(10)} (before exponents)`,
    baseCost: 1e7,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
  }),
  weakenPelleScaling: rebuyable({
    id: "weakenPelleScaling",
    intId: 6,
    celestial: "pelle",
    description: () => `Weaken Pelle's level cost by ${formatX(10)} (before exponents)`,
    baseCost: 1e7,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
  }),
  incTeresaXPGain: rebuyable({
    id: "betterTeresaXP",
    intId: 7,
    celestial: "teresa",
    description: () => `Increase Teresa's XP gain by ${formatX(10)} (before exponents)`,
    baseCost: 1e11,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
  }),
  incEffarigXPGain: rebuyable({
    id: "betterEffarigXP",
    intId: 8,
    celestial: "effarig",
    description: () => `Increase Effarig's XP gain by ${formatX(10)} (before exponents)`,
    baseCost: 1e11,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
  }),
  incEnslavedXPGain: rebuyable({
    id: "betterEnslavedXP",
    intId: 9,
    celestial: "enslaved",
    description: () => `Increase Nameless' XP gain by ${formatX(10)} (before exponents)`,
    baseCost: 1e11,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
  }),
  incVXPGain: rebuyable({
    id: "betterVXP",
    intId: 10,
    celestial: "v",
    description: () => `Increase V's XP gain by ${formatX(10)} (before exponents)`,
    baseCost: 1e11,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
  }),
  incRaXPGain: rebuyable({
    id: "betterRaXP",
    intId: 11,
    celestial: "ra",
    description: () => `Increase Ra's XP gain by ${formatX(10)} (before exponents)`,
    baseCost: 1e11,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
  }),
  incLaitelaXPGain: rebuyable({
    id: "betterLaitelaXP",
    intId: 12,
    celestial: "laitela",
    description: () => `Increase Laitela's XP gain by ${formatX(10)} (before exponents)`,
    baseCost: 1e11,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
  }),
  incPelleXPGain: rebuyable({
    id: "betterPelleXP",
    celestial: "pelle",
    intId: 13,
    description: () => `Increase Pelle's XP gain by ${formatX(10)} (before exponents)`,
    baseCost: 1e11,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
  }),
  temp1: {
    id: "temp1",
    celestial: "teresa",
    description: "Placeholder",
    cost: 0,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
    implemented: false,
  },
  temp2: {
    id: "temp2",
    celestial: "effarig",
    description: "Placeholder",
    cost: 0,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
    implemented: false,
  },
  temp3: {
    id: "temp3",
    celestial: "enslaved",
    description: "Placeholder",
    cost: 0,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
    implemented: false,
  },
  temp4: {
    id: "temp4",
    celestial: "v",
    description: "Placeholder",
    cost: 0,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
    implemented: false,
  },
  temp5: {
    id: "temp5",
    celestial: "ra",
    description: "Placeholder",
    cost: 0,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
    implemented: false,
  },
  temp6: {
    id: "temp6",
    celestial: "laitela",
    description: "Placeholder",
    cost: 0,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
    implemented: false,
  },
  temp7: {
    id: "temp7",
    celestial: "pelle",
    description: "Placeholder",
    cost: 0,
    currency: () => Currency.antimatter,
    currencyLabel: "NYI",
    implemented: false,
  },
}