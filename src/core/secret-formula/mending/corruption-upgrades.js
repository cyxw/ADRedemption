import { DC } from "../../constants";


export const corruptionUpgrades = [
  {
    name: "Memory Perfection",
    id: 1,
    cost: 2,
    requirement: `Please send your save to the devs with an image of this - You should never be able to see this`,
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: () => `Ra memory gain is ${formatX(1500, 1)} stronger, but only when in the appropriate celestials Reality.`,
    effect: 1500
  },
  {
    name: "Spacetime Distruption",
    id: 2,
    cost: 2,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "Game speed is multiplied based on highest score (before instability, Applies after hostilities, but weaker in Hostile multiverse)",
    effect: () => player.mending.corruptionChallenge.corruptedMend ? Decimal.pow10(Math.pow(player.mending.corruptionChallenge.recordScore, 0.25)) : (Decimal.pow10(Math.pow(player.mending.corruptionChallenge.recordScore, 1/1.48))),
    formatEffect: value => formatX(value, 2)
  },
  {
    name: "Rewarding Achievements",
    id: 3,
    cost: 2,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "Gain a power effect to achievement power effects, after softcaps, based on unspent Hostile Fragments. ",
    effect: () => 1 + Math.log(1 + (player.mending.corruptedFragments)/3) / 10, // We do math.log not math.log10 here since we do want the natural log of CF, not the base 10 log
    formatEffect: value => `^` + format(value, 2, 2)
  },
  {
    name: "Singularity Cap",
    id: 4,
    cost: 2,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "Give extra 10 increase Singularity cap.",
    effect: () => 10
  },
  {
    name: "Perk Limit",
    id: 5,
    cost: 2,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "The first two upgrades of Perk Shop cap are massively increased.",
    effect: () => 1
  },
  {
    name: "Doomed Options",
    id: 6,
    cost: 3,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "Give one extra Glyph slot in Doomed Reality",
    effect: () => 1
  },
  {
    name: "Help Effarig can do nothing",
    id: 7,
    cost: 3,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "Improve Effarig level 15 improvement.",
    effect: () => 1
  },
  {
    name: "Tesseract Movement",
    id: 8,
    cost: 3,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "Gain a multiplier to effective Tesseract count, based on unspent Hostile Fragments.",
    effect: () => 1 + Math.log(1 + (player.mending.corruptedFragments)) / 5,
    formatEffect: value => formatX(value, 2, 2)
  },
  {
    name: "Crystal Galaxies",
    id: 9,
    cost: 3,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "Memory Crystal delays Obscure Galaxy scaling",
    effect: () => Math.round(Decimal.log10(player.celestials.ra.raPoints.plus(1))*10),
    formatEffect: value => `+` + formatInt(value)
  },
  {
    name: "Sacrifice Exponent",
    id: 10,
    cost: 3,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "Dimensional Sacrifice's exponent ^1.25",
    effect: () => 1.25
  },
  {
    name: "Black Hole",
    id: 11,
    cost: 4,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "Black Hole 1 & 2's base multiplier is increased.",
    effect: () => 2.5,
    formatEffect: value => formatX(value, 1, 1)
  },
  {
    name: "Nerf Every Curse",
    id: 12,
    cost: 4,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "Every generated Cursed Glyph's level reduced to 666.",
    effect: () => 1,
  },
  {
    name: "More MvR!!!!!!!",
    id: 13,
    cost: 4,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "Multiplier to Multiversal Remains based on your record score.",
    effect: () => Math.max(CorruptionData.corruptionChallenge.recordScore,1),
    formatEffect: value => formatX(value, 2, 2)
  },
  {
    name: "Alchemy Cap",
    id: 14,
    cost: 4,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "Increase Alchemy hardcap based on your record score.",
    effect: () => Math.round(Math.log(CorruptionData.corruptionChallenge.recordScore+1)/Math.log(1.005)),
    formatEffect: value => `+${formatInt(value)}`
  },
  {
    name: "Generation",
    id: 15,
    cost: 4,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "8th Antimatter Dimension generat 8th Dark Matter Dimension (once unlocked)",
    effect: () => Decimal.log10(AntimatterDimensions.all[7].totalAmount.plus(1))*10,
    formatEffect: value => `${format(value, 2, 2)} per Second`
  },
  {
    name: "Prestige Extension",
    id: 16,
    cost: 5,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: () => `Prestige Limits power is now doubled, capped at ${formatInt(1)}`,
  },
  {
    name: "Dimension Superscaling",
    id: 17,
    cost: 5,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: () => `If Dimensional Limitations corruption is 5 or higher, Antimatter dimensions gain a power effect based on highest Glyph Level this mend.`,
    effect: () => (player.mending.corruptionChallenge.corruptedMend && player.mending.corruption[1] >= 5 && player.records.bestReality.glyphLevelSet.length!=0) ? 1 + Math.log(player.records.bestReality.glyphLevel)/10 : 1,
    formatEffect: value => formatPow(value, 2, 2)
  },
  {
    name: "Time Expansion",
    id: 18,
    cost: 5,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: () => `Time Compression power +${format(0.01, 2, 2)} (capped at +${formatInt(1)}), Time compression devisor ${formatPow(0.1, 1, 1)}`,
  },
  {
    name: "Galaxy Strengthening",
    id: 19,
    cost: 5,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: () => `Galactic Weakness - Scaling is ^0.5, and power is ${formatX(1.4, 1, 1)} (capped at ${formatX(1)})`,
    effect: () => 1,
  },
  {
    name: "Rewarding Glyphs",
    id: 20,
    cost: 5,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: "If Complex Glyphs is level 4 or higher, gain a power effect to score, based on glyph levels and Complex Glyphs level.",
    effect: () => player.mending.corruptionChallenge.corruptedMend && (player.mending.corruption[4] >= 4) ? 1 + Math.log(Math.log(player.mending.corruption[4] * Math.max(1,player.records.bestReality.glyphLevel)))/2.5 : 1,
    formatEffect: value => formatPow(value, 2, 2)
  },
  {
    name: "Tick Extension",
    id: 21,
    cost: 5,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: () => `Tick Extension Tickspeed power ^0.5, Time shard divisor ^0.75.`,
    effect: () => 1,
  },
  {
    name: "Automic Dilution",
    id: 22,
    cost: 5,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: () => `Automic Dilution power is now ×1.5, capped at ${formatInt(1)}`,
    effect: () => 1,
  },
  {
    name: "Theory of Dilation",
    id: 23,
    cost: 5,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: `Theory of Dilation power +0.2, and DT gain ×1e5 if level 1 or more.`,
    effect: () => 1,
  },
  {
    name: "Replicative Singularities",
    id: 24,
    cost: 5,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: `If Replicative Singularities corruption is 5 or higher, Infinity dimensions gain a power effect based on current Replicanti. Capped at ^5.`,
    effect: () => player.mending.corruptionChallenge.corruptedMend && (player.mending.corruption[8] >= 5) ? Math.min(1+(Decimal.log10(player.replicanti.amount))/1000,5) : 1,
    formatEffect: value => formatPow(value, 2, 2)
  },
  {
    name: "Study of Forever",
    id: 25,
    cost: 5,
    requirement: "Please send your save to the devs with an image of this - You should never be able to see this",
    hasFailed: () => false,
    checkRequirement: () => false,
    checkEvent: GAME_EVENT.MENDING_RESET_BEFORE,
    canLock: false,
    lockEvent: "Illegal lock called - Please report this with your save and what you did.",
    description: `If Study of Forever corruption is 4 or higher, Time dimensions gain a power effect based on current Time Theorems. Capped at ^5.`,
    effect: () => player.mending.corruptionChallenge.corruptedMend && (player.mending.corruption[9] >= 4) ? Math.min(1+(Decimal.log10(Currency.timeTheorems.value))/1000,5) : 1,
    formatEffect: value => formatPow(value, 2, 2)
  },
];
