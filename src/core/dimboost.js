import { DC } from "./constants";
import { Currency } from "./currency";
import { corruptionPenalties } from "./secret-formula/mending/corruption";
import { WarpUpgrade } from "./warp-upgrades";

export const DIMBOOST_TYPE = {
  BOOST: 0,
  SHIFT: 1,
  WARP: 2,
  SCALE: 3
};

class DimBoostRequirement {
  constructor(tier, amount) {
    this.tier = tier;
    this.amount = amount;
  }

  get isSatisfied() {
    const dimension = AntimatterDimension(this.tier);
    return dimension.totalAmount.gte(this.amount);
  }
}

export class DimBoost {
  static get scaleStart(){
    let x = 5e13;
    if(WarpUpgrade(10).isBought) x*=20;
    return x;
  }
  static get warpStart() {
    let x =2.5e11;
    if(WarpUpgrade(10).isBought) x*=20;
    return x;
  }

  static get shiftStart() {
    let x = 1e9;
    if(WarpUpgrade(10).isBought) x*=20;
    return x;
  }

  static get power() {
    if (NormalChallenge(8).isRunning) {
      return DC.D1;
    }

    let boost = Effects.max(
      2,
      InfinityUpgrade.dimboostMult,
      InfinityChallenge(7).reward,
      InfinityChallenge(7),
      TimeStudy(81)
    )
      .toDecimal()
      .timesEffectsOf(
        TimeStudy(83),
        TimeStudy(231),
        Achievement(117),
        Achievement(142),
        GlyphEffect.dimBoostPower,
        PelleRifts.recursion.milestones[0]
      ).powEffectsOf(InfinityUpgrade.dimboostMult.chargedEffect);
    if (GlyphAlteration.isAdded("effarig")) boost = boost.pow(getSecondaryGlyphEffect("effarigforgotten"));
    return boost;
  }

  static multiplierToNDTier(tier) {
    const normalBoostMult = DimBoost.power.pow(this.purchasedBoosts + 1 - tier).clampMin(1);
    const imaginaryBoostMult = DimBoost.power.times(ImaginaryUpgrade(24).effectOrDefault(1))
      .pow(this.imaginaryBoosts).clampMin(1);
    return normalBoostMult.times(imaginaryBoostMult);
  }

  static get maxDimensionsUnlockable() {
    return NormalChallenge(10).isRunning ? 6 : 8;
  }

  static get canUnlockNewDimension() {
    return DimBoost.purchasedBoosts + 4 < DimBoost.maxDimensionsUnlockable;
  }

  static get maxBoosts() {
    //woah nice design here--sxy
    let corruptionMax = 1e15;
    if (Kohler.isRunning) return 0;
    if (player.mending.corruptionChallenge.corruptedMend) corruptionMax = corruptionPenalties.galWeak.hiddenThree[player.mending.corruption[3]];
    if (Ra.isRunning) {
      // Ra makes boosting impossible. Note that this function isn't called
      // when giving initial boosts, so the player will still get those.
      return Ra.unlocks.raRealUncapDimboost.isUnlocked ? corruptionMax : 0;
    }
    if (InfinityChallenge(1).isRunning) {
      // Usually, in Challenge 8, the only boosts that are useful are the first 5
      // (the fifth unlocks sacrifice). In IC1 (Challenge 8 and Challenge 10
      // combined, among other things), only the first 2 are useful
      // (they unlock new dimensions).
      // There's no actual problem with bulk letting the player get
      // more boosts than this; it's just that boosts beyond this are pointless.
      return 2;
    }
    if (NormalChallenge(8).isRunning) {
      // See above. It's important we check for this after checking for IC1 since otherwise
      // this case would trigger when we're in IC1.
      return 5;
    }
    return corruptionMax;//this might be extended later.--sxy
  }

  static get type() {
    return this.typeAt(player.dimensionBoosts);
  }

  static typeAt(dimboosts) {
    if (dimboosts >= DimBoost.scaleStart) {
      return DIMBOOST_TYPE.SCALE;
    }
    if (dimboosts >= DimBoost.warpStart) {
      return DIMBOOST_TYPE.WARP;
    }
    if (dimboosts >= DimBoost.shiftStart) {
      return DIMBOOST_TYPE.SHIFT;
    }
    return DIMBOOST_TYPE.BOOST;
  }

  static get canBeBought() {
    if (DimBoost.purchasedBoosts >= this.maxBoosts) return false;
    if (player.records.thisInfinity.maxAM.gt(Player.infinityGoal) &&
       (!player.break || Player.isInAntimatterChallenge)) return false;
    return true;
  }

  static get lockText() {
    let boostCap = 1e12;
    if (DimBoost.purchasedBoosts >= this.maxBoosts) {
      if (Kohler.isRunning) return "Locked (Kohler's Realm)";
      if (Ra.isRunning) return "Locked (Ra's Reality)";
      if (InfinityChallenge(1).isRunning) return "Locked (Infinity Challenge 1)";
      if (NormalChallenge(8).isRunning) return "Locked (8th Antimatter Dimension Autobuyer Challenge)";
    }
    return player.dimensionBoosts >= this.maxBoosts ? "Capped at " + formatInt(boostCap) +" Dimension Boosts" : null;
  }

  static get requirement() {
    return this.bulkRequirement(1);
  }

  static bulkRequirement(bulk) {
    const targetResets = DimBoost.purchasedBoosts + bulk;
    const tier = Math.min(targetResets + 3, this.maxDimensionsUnlockable);
    let amount = 20;
    const discount = Effects.sum(
      TimeStudy(211),
      TimeStudy(222)
    );
    if (tier === 6 && NormalChallenge(10).isRunning) {
      amount += Math.round((targetResets - 3) * (20 - discount));
    } else if (tier === 8) {
      amount += Math.round((targetResets - 5) * (15 - discount));
    }
    if (EternityChallenge(5).isRunning) {
      amount += Math.pow(targetResets - 1, 3) + targetResets - 1;
    }

    if (DimBoost.purchasedBoosts > DimBoost.shiftStart) {
      amount += Math.pow(targetResets - DimBoost.shiftStart, 1 + targetResets/(DimBoost.shiftStart * 10)) + targetResets - DimBoost.shiftStart
    }

    if (DimBoost.purchasedBoosts > DimBoost.warpStart) {
      amount += Math.pow(targetResets - DimBoost.warpStart, 1 + targetResets/(DimBoost.warpStart/10)) + targetResets - DimBoost.warpStart
    }

    if (DimBoost.purchasedBoosts > DimBoost.scaleStart) {
      amount += Math.pow(targetResets - DimBoost.scaleStart, 1 + targetResets/(DimBoost.scaleStart / 1e5)) + targetResets - DimBoost.scaleStart
    }

    amount -= Effects.sum(InfinityUpgrade.resetBoost);
    if (InfinityChallenge(5).isCompleted) amount -= 1;

    amount *= InfinityUpgrade.resetBoost.chargedEffect.effectOrDefault(1);

    // Ra ra upgrade--sxy
    if(player.celestials.ra.upgrades.has('raUpgrade')) amount = (amount / Decimal.log10(player.celestials.ra.raPoints.plus(1)))

    amount = Math.round(amount);
    
    return new DimBoostRequirement(tier, amount);
  }


  static get unlockedByBoost() {
    if (DimBoost.lockText !== null) return DimBoost.lockText;
    const boosts = DimBoost.purchasedBoosts;
    const allNDUnlocked = EternityMilestone.unlockAllND.isReached;

    let newUnlock = "";
    if (!allNDUnlocked && boosts < DimBoost.maxDimensionsUnlockable - 4) {
      newUnlock = `unlock the ${boosts + 5}th Dimension`;
    } else if (boosts === 4 && !NormalChallenge(10).isRunning && !EternityChallenge(3).isRunning) {
      newUnlock = "unlock Sacrifice";
    }

    const formattedMultText = `give a ${formatX(DimBoost.power, 2, 1)} multiplier `;
    let dimensionRange = `to the 1st Dimension`;
    if (boosts > 0) dimensionRange = `to Dimensions 1-${Math.min(boosts + 1, 8)}`;
    if (boosts >= DimBoost.maxDimensionsUnlockable - 1) dimensionRange = `to all Dimensions`;

    let boostEffects;
    if (NormalChallenge(8).isRunning) boostEffects = newUnlock;
    else if (newUnlock === "") boostEffects = `${formattedMultText} ${dimensionRange}`;
    else boostEffects = `${newUnlock} and ${formattedMultText} ${dimensionRange}`;

    if (boostEffects === "") return "Dimension Boosts are currently useless";
    const areDimensionsKept = (Perk.antimatterNoReset.isBought || Achievement(111).canBeApplied) &&
      (!Pelle.isDoomed || PelleUpgrade.dimBoostResetsNothing.isBought);
    if (areDimensionsKept) return boostEffects[0].toUpperCase() + boostEffects.substring(1);
    return `Reset your Dimensions to ${boostEffects}`;
  }

  static get purchasedBoosts() {
    return Math.floor(player.dimensionBoosts);
  }

  static get imaginaryBoosts() {
    let x = BreakInfinityUpgrade.autobuyMaxDimboosts.chargedEffect.isEffectActive ? Ra.pets.teresa.level : 1;
    let y = Ra.unlocks.freeDimBoosts.isUnlocked ? (1+(Ra.pets.ra.level / 100)) ** 0.5 : 1;
    //let ts401 = TimeStudy(401).isBought ? 1e11 : 0; //useless~
    return (Kohler.isRunning || (Ra.isRunning && !Ra.unlocks.imaginaryBoostsRa.isUnlocked)) ? 0 : ImaginaryUpgrade(12).effectOrDefault(0) * ImaginaryUpgrade(23).effectOrDefault(1) * Math.pow(x, 0.5) * y;
  }

  static get totalBoosts() {
    return Math.floor(this.purchasedBoosts + this.imaginaryBoosts);
  }

  static get startingDimensionBoosts() {
    if (InfinityUpgrade.skipResetGalaxy.isBought) return 4;
    if (InfinityUpgrade.skipReset3.isBought) return 3;
    if (InfinityUpgrade.skipReset2.isBought) return 2;
    if (InfinityUpgrade.skipReset1.isBought) return 1;
    return 0;
  }
}

// eslint-disable-next-line max-params
export function softReset(tempBulk, forcedADReset = false, forcedAMReset = false, enteringAntimatterChallenge = false) {
//  if (Currency.antimatter.gt(Player.infinityLimit)) return;
  const bulk = Math.min(tempBulk, DimBoost.maxBoosts - player.dimensionBoosts);
  EventHub.dispatch(GAME_EVENT.DIMBOOST_BEFORE, bulk);
  player.dimensionBoosts = Math.max(0, player.dimensionBoosts + bulk);
  resetChallengeStuff();
  const canKeepDimensions = Pelle.isDoomed
    ? PelleUpgrade.dimBoostResetsNothing.canBeApplied
    : Perk.antimatterNoReset.canBeApplied;
  if (forcedADReset || !canKeepDimensions) {
    AntimatterDimensions.reset();
    player.sacrificed = DC.D0;
    resetTickspeed();
  }
  skipResetsIfPossible(enteringAntimatterChallenge);
  const canKeepAntimatter = Pelle.isDoomed
    ? PelleUpgrade.dimBoostResetsNothing.canBeApplied
    : (Achievement(111).isUnlocked || Perk.antimatterNoReset.canBeApplied);
  if (!forcedAMReset && canKeepAntimatter) {
    Currency.antimatter.bumpTo(Currency.antimatter.startingValue);
  } else {
    Currency.antimatter.reset();
  }
  EventHub.dispatch(GAME_EVENT.DIMBOOST_AFTER, bulk);
}

export function skipResetsIfPossible(enteringAntimatterChallenge) {
  if (enteringAntimatterChallenge || Player.isInAntimatterChallenge) return;
  if (InfinityUpgrade.skipResetGalaxy.isBought && player.dimensionBoosts < 4) {
    player.dimensionBoosts = 4;
    if (player.galaxies === 0) player.galaxies = 1;
  } else if (InfinityUpgrade.skipReset3.isBought && player.dimensionBoosts < 3) player.dimensionBoosts = 3;
  else if (InfinityUpgrade.skipReset2.isBought && player.dimensionBoosts < 2) player.dimensionBoosts = 2;
  else if (InfinityUpgrade.skipReset1.isBought && player.dimensionBoosts < 1) player.dimensionBoosts = 1;
}

export function manualRequestDimensionBoost(bulk) {
  if (!DimBoost.requirement.isSatisfied) return;
  if (!DimBoost.canBeBought) return;
  if (GameEnd.creditsEverClosed && !PlayerProgress.mendingUnlocked()) return;
  if (player.options.confirmations.dimensionBoost) {
    Modal.dimensionBoost.show({ bulk });
    return;
  }
  requestDimensionBoost(bulk);
}

export function requestDimensionBoost(bulk) {
  if (!DimBoost.requirement.isSatisfied) return;
  if (!DimBoost.canBeBought) return;
  Tutorial.turnOffEffect(TUTORIAL_STATE.DIMBOOST);
  if (BreakInfinityUpgrade.autobuyMaxDimboosts.isBought && bulk) maxBuyDimBoosts();
  else softReset(1);
}

function maxBuyDimBoosts() {
  // Boosts that unlock new dims are bought one at a time, unlocking the next dimension
  if (DimBoost.canUnlockNewDimension) {
    if (DimBoost.requirement.isSatisfied) softReset(1);
    return;
  }
  const req1 = DimBoost.bulkRequirement(1);
  if (!req1.isSatisfied) return;
  const req2 = DimBoost.bulkRequirement(2);
  if (!req2.isSatisfied) {
    softReset(1);
    return;
  }
  // Linearly extrapolate dimboost costs. req1 = a * 1 + b, req2 = a * 2 + b
  // so a = req2 - req1, b = req1 - a = 2 req1 - req2, num = (dims - b) / a
  let increase = req2.amount - req1.amount;
  const dim = AntimatterDimension(req1.tier);
  //wtf precise error here--sxy
  //honestly shall we do a decimal here......
  if (increase == 0) increase=1e-20;//temporary fix
  let fixedValue = (dim.totalAmount.toNumber() - req1.amount) / increase
  if(fixedValue == Infinity)fixedValue=1e308;
  if(fixedValue == -Infinity)fixedValue=-1e308;
  let maxBoosts = Math.min(1e9,
    1 + Math.floor( fixedValue ));
  if(maxBoosts<0) return;
  if (DimBoost.bulkRequirement(maxBoosts).isSatisfied) {
    softReset(maxBoosts);
    return;
  }
  // But in case of EC5 it's not, so do binary search for appropriate boost amount
  let minBoosts = 2;
  while (maxBoosts !== minBoosts + 1) {
    const middle = Math.floor((maxBoosts + minBoosts) / 2);
    if (DimBoost.bulkRequirement(middle).isSatisfied) minBoosts = middle;
    else maxBoosts = middle;
  }
  softReset(minBoosts);
}
