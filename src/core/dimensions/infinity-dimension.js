import { DC } from "../constants";
import { CorruptionUpgrade } from "../corruption-upgrades";
import { Currency } from "../currency";
import { corruptionPenalties } from "../secret-formula/mending/corruption";
import { WarpUpgrade } from "../warp-upgrades";

import { DimensionState } from "./dimension";

export function infinityDimensionCommonMultiplier() {
  let mult = new Decimal(ShopPurchase.allDimPurchases.currentMult)
    .timesEffectsOf(
      Achievement(75),
      TimeStudy(82),
      TimeStudy(92),
      TimeStudy(162),
      InfinityChallenge(1).reward,
      InfinityChallenge(6).reward,
      EternityUpgrade.idMultEP,
      EternityUpgrade.idMultEternities,
      EternityUpgrade.idMultICRecords,
      AlchemyResource.dimensionality,
      ImaginaryUpgrade(8),
      PelleRifts.recursion.milestones[1]
    );
  
  if (Pelle.isDoomed && EternityChallenge(4).completions >= 1) {
    mult = mult.timesEffectsOf(EternityChallenge(4).reward);
  }
  if (Pelle.isDoomed && EternityChallenge(9).completions >= 1) {
    mult = mult.timesEffectsOf(EternityChallenge(9).reward);
  }
  if (Ra.unlocks.improvedECRewards.isUnlocked && EternityChallenge(9).completions >= 1 && !Pelle.isDoomed) {
    mult = mult.timesEffectsOf(EternityChallenge(9).vReward);
  }
  if (Replicanti.areUnlocked && Replicanti.amount.gt(1)) {
    mult = mult.times(replicantiMult());
  }

  if(Ra.unlocks.vAchMilestone2AffectsIDsAndTDs.isUnlocked) {
    mult = mult.pow(VUnlocks.adPow.effectOrDefault(1), 0.5);
  }
  return mult;
}

export function toggleAllInfDims() {
  const areEnabled = Autobuyer.infinityDimension(1).isActive;
  for (let i = 1; i < 9; i++) {
    Autobuyer.infinityDimension(i).isActive = !areEnabled;
  }
}

class InfinityDimensionState extends DimensionState {
  constructor(tier) {
    super(() => player.dimensions.infinity, tier);
    const UNLOCK_REQUIREMENTS = [
      undefined,
      DC.E1100,
      DC.E1900,
      DC.E2400,
      DC.E10500,
      DC.E30000,
      DC.E45000,
      DC.E54000,
      DC.E60000,
    ];
    this._unlockRequirement = UNLOCK_REQUIREMENTS[tier];
    const COST_MULTS = [null, 1e3, 1e6, 1e8, 1e10, 1e15, 1e20, 1e25, 1e30];
    this._costMultiplier = COST_MULTS[tier];
    const POWER_MULTS = [null, 50, 30, 10, 5, 5, 5, 5, 5];
    this._powerMultiplier = POWER_MULTS[tier];
    const BASE_COSTS = [null, 1e8, 1e9, 1e10, 1e20, 1e140, 1e200, 1e250, 1e280];
    this._baseCost = new Decimal(BASE_COSTS[tier]);
    this.ipRequirement = BASE_COSTS[1];
  }

  /** @returns {Decimal} */
  get cost() { return this.data.cost; }
  /** @param {Decimal} value */
  set cost(value) { this.data.cost = value; }

  get baseAmount() {
    return this.data.baseAmount;
  }

  set baseAmount(value) {
    this.data.baseAmount = value;
  }

  get isUnlocked() {
    return this.data.isUnlocked;
  }

  set isUnlocked(value) {
    this.data.isUnlocked = value;
  }

  get amRequirement() {
    return this._unlockRequirement;
  }

  get antimatterRequirementReached() {
    return player.records.thisEternity.maxAM.gte(this.amRequirement);
  }

  get hasIPUnlock() {
    return this.tier === 1 && !PlayerProgress.eternityUnlocked();
  }

  get ipRequirementReached() {
    return !this.hasIPUnlock || Currency.infinityPoints.value.gte(this.ipRequirement);
  }

  get canUnlock() {
    return (Perk.bypassIDAntimatter.canBeApplied || this.antimatterRequirementReached) &&
      this.ipRequirementReached;
  }

  get isAvailableForPurchase() {
    return InfinityDimensions.canBuy() && this.isUnlocked && this.isAffordable && !this.isCapped;
  }

  get isAffordable() {
    return Currency.infinityPoints.gte(this.cost);
  }

  get rateOfChange() {
    const tier = this.tier;
    let toGain = DC.D0;
    if (tier === 8) {
      // We need a extra 10x here (since ID8 production is per-second and
      // other ID production is per-10-seconds).
      EternityChallenge(7).reward.applyEffect(v => toGain = v.times(10));
      if (EternityChallenge(7).isRunning) EternityChallenge(7).applyEffect(v => toGain = v.times(10));
    } else {
      toGain = InfinityDimension(tier + 1).productionPerSecond;
    }
    const current = Decimal.max(this.amount, 1);
    return toGain.times(10).dividedBy(current).times(getGameSpeedupForDisplay());
  }

  get infPowerSoftcap(){
    let x = 9e15;
    x += WarpUpgrade(1).effectOrDefault(0)
    return x;
  }

  get infPowerSoftcapTwo(){
    let x = 1e21;
    return x;
  }

  get productionPerSecond() {
    if (EternityChallenge(2).isRunning || EternityChallenge(10).isRunning ||
      (Laitela.isRunning && this.tier > Laitela.maxAllowedDimension)) {
      return DC.D0;
    }
    let production = this.totalAmount;
    if (EternityChallenge(11).isRunning) {
      return production;
    }
    if (EternityChallenge(7).isRunning) {
      production = production.times(Tickspeed.perSecond);
    }
    production = production.times(this.multiplier);
    //mend: Inf Power Gain softcap --sxy
    let repeats = 1;
    /*while (factor.gte(Decimal.pow(getGameSpeedupSoftcaps(), repeats))) {
    factor = factor.div(getGameSpeedupSoftcaps());
    factor = factor.pow(getGameSpeedupSoftcapsExp());
    factor = factor.times(getGameSpeedupSoftcaps());
    repeats += 1;
    }*/
    if (this.tier == 1){
      while (Math.log10(production.log10()) > Math.log10(this.infPowerSoftcap)*repeats) {
        production = production.div(Decimal.pow10(this.infPowerSoftcap));   
        production = production.pow(0.0123456789);
        production = production.times(Decimal.pow10(this.infPowerSoftcap));
        if (Math.log10(production.log10()) > Math.log10(this.infPowerSoftcapTwo)*repeats && repeats === 1){
          production = production.div(Decimal.pow10(this.infPowerSoftcapTwo));   
          production = production.pow(1e-4);
          production = production.times(Decimal.pow10(this.infPowerSoftcapTwo));
        }
        repeats += 1
      }
    }
    return production;
  }

  get multiplier() {
    const tier = this.tier;
    if (EternityChallenge(11).isRunning) return DC.D1;
    let mult = GameCache.infinityDimensionCommonMultiplier.value
      .timesEffectsOf(
        tier === 1 ? Achievement(94) : null,
        tier === 4 ? TimeStudy(72) : null,
        TimeStudy(312),
      );
    if (EternityChallenge(2).completions >= 1){
      mult = mult.timesEffectsOf(
        tier === 1 ? EternityChallenge(2).reward : null,
      );
    }
    mult = mult.times(Decimal.pow(this.powerMultiplier, Math.floor(this.baseAmount / 10)));


    if (tier === 1) {
      mult = mult.times(PelleRifts.decay.milestones[0].effectOrDefault(1));
      mult = mult.times(TimeStudy(412).effectOrDefault(1));
    }


    mult = mult.pow(getAdjustedGlyphEffect("infinitypow"));
    mult = mult.pow(getAdjustedGlyphEffect("effarigdimensions"));
    mult = mult.pow(getAdjustedGlyphEffect("curseddimensions"));
    mult = mult.powEffectOf(AlchemyResource.infinity);
    mult = mult.pow(Ra.momentumValue);
    mult = mult.powEffectOf(PelleRifts.paradox);
    if(Ra.unlocks.improvedECRewards.isUnlocked && !Pelle.isDoomed){
      if(EternityChallenge(2).completions >= 1) mult = mult.pow(EternityChallenge(2).vReward.effectValue);
      if(EternityChallenge(4).completions >= 1) mult = mult.pow(EternityChallenge(4).vReward.effectValue);
    }
    if (EternityChallenge(4).completions >= 1) {
      mult = mult.timesEffectsOf(EternityChallenge(4).reward);
    }

    if (player.dilation.active || PelleStrikes.dilation.hasStrike) {
      mult = dilatedValueOf(mult);
    }
    if (Kohler.isRunning){
      mult = mult.pow(5e-7)
    }
    if (Effarig.isRunning) {
      mult = Effarig.multiplier(mult);
    } else if (V.isRunning) {
      mult = mult.pow(0.5);
    } else if (V.isSuperRunning) {
      mult = mult.pow(0.000001);
    }

    if (PelleStrikes.powerGalaxies.hasStrike && !MendingUpgrade(10).isBought) {
      mult = mult.pow(0.5);
    }

    if (CorruptionUpgrade(24).isBought&&player.mending.corruptionChallenge.corruptedMend&&player.mending.corruption[8]>=5){
      mult = mult.pow(CorruptionUpgrade(24).effectOrDefault(1));
    }
    return mult;
  }

  get isProducing() {
    const tier = this.tier;
    if (EternityChallenge(2).isRunning ||
      EternityChallenge(10).isRunning ||
      (Laitela.isRunning && tier > Laitela.maxAllowedDimension)) {
      return false;
    }
    return this.totalAmount.gt(0);
  }

  get baseCost() {
    return this._baseCost;
  }

  get costMultiplier() {
    let costMult = this._costMultiplier;
    if(EternityChallenge(12).completions >= 1) costMult = Math.pow(costMult, EternityChallenge(12).reward.effectValue);
    return costMult;
  }

  get powerMultiplier() {
    return new Decimal(this._powerMultiplier)
      .timesEffectsOf(this._tier === 8 ? GlyphSacrifice.infinity : null)
      .pow(ImaginaryUpgrade(14).effectOrDefault(1));
  }

  get purchases() {
    // Because each ID purchase gives 10 IDs
    return this.data.baseAmount / 10;
  }

  get purchaseCap() {
    if (Enslaved.isRunning || Kohler.isRunning) {
      return 1;
    }
     // return InfinityDimensions.totalDimCap * (this.tier == 8 ? 100 : 1);
     const x = (Ra.unlocks.improvedECRewards.isUnlocked && EternityChallenge(12).completions >= 1 && !Pelle.isDoomed) ? EternityChallenge(12).vReward.effectValue : 1
     let y = this.tier == 8 ? 1e10 : InfinityDimensions.totalDimCap ** x
     if (player.timestudy.studies.includes(310)) y = this.tier == 8 ? 1e10 * (Math.max(Math.log10(Currency.replicanti.value.exponent),1)) : (InfinityDimensions.totalDimCap * (Math.max(Math.log10(Currency.replicanti.value.exponent),1)))**x
     return y;
  }

  get isCapped() {
    return this.purchases >= this.purchaseCap;
  }

  get hardcapIPAmount() {
    return this._baseCost.times(Decimal.pow(this.costMultiplier, this.purchaseCap));
  }

  get continuumValue() {
    if(Pelle.isDoomed) return 0;
    if(!this.isUnlocked) return 0;
    if(!Ra.continuumActive) return 0;
    const logMoney = Currency.infinityPoints.value.log10();
    const logMult = Math.log10(this.costMultiplier);
    const logBase = this.baseCost.log10();
    let contValue = (logMoney - logBase)/logMult;
    contValue *= 1 + Laitela.matterExtraPurchaseFactor * .1;
    /*if(this.tier < 8)*/ contValue = Math.clampMax(contValue, this.purchaseCap);
    return Math.clampMin(contValue, 0);
  }

  get totalAmount() {
    //if (this.tier==8) return Decimal.min(this.amount.max(this.continuumValue*10),1e25);
    return this.amount.max(this.continuumValue*10);
  }

  resetAmount() {
    this.amount = new Decimal(this.baseAmount);
  }

  fullReset() {
    this.cost = new Decimal(this.baseCost);
    this.amount = DC.D0;
    this.bought = 0;
    this.baseAmount = 0;
    this.isUnlocked = false;
  }

  unlock() {
    if (this.isUnlocked) return true;
    if (!this.canUnlock) return false;
    this.isUnlocked = true;
    EventHub.dispatch(GAME_EVENT.INFINITY_DIMENSION_UNLOCKED, this.tier);
    if (this.tier === 1 && !PlayerProgress.eternityUnlocked()) {
      Tab.dimensions.infinity.show();
    }
    return true;
  }

  // Only ever called from manual actions
  buySingle() {
    if (!this.isUnlocked) return this.unlock();
    if (!this.isAvailableForPurchase) return false;
    if (ImaginaryUpgrade(15).isLockingMechanics) {
      const lockString = this.tier === 1
        ? "purchase a 1st Infinity Dimension"
        : "purchase a Dimension which will produce 1st IDs";
      ImaginaryUpgrade(15).tryShowWarningModal(lockString);
      return false;
    }

    Currency.infinityPoints.purchase(this.cost);
    this.cost = Decimal.round(this.cost.times(this.costMultiplier));
    // Because each ID purchase gives 10 IDs
    this.amount = this.amount.plus(10);
    this.baseAmount += 10;

    if (EternityChallenge(8).isRunning) {
      player.eterc8ids -= 1;
    }
    
    return true;
  }

  buyMax(auto) {
    if (!this.isAvailableForPurchase) return false;
    if (ImaginaryUpgrade(15).isLockingMechanics) {
      const lockString = this.tier === 1
        ? "purchase a 1st Infinity Dimension"
        : "purchase a Dimension which will produce 1st IDs";
      if (!auto) ImaginaryUpgrade(15).tryShowWarningModal(lockString);
      return false;
    }

    let purchasesUntilHardcap = this.purchaseCap - this.purchases;
    if (EternityChallenge(8).isRunning) {
      purchasesUntilHardcap = Math.clampMax(purchasesUntilHardcap, player.eterc8ids);
    }

    const costScaling = new LinearCostScaling(
      Currency.infinityPoints.value,
      this.cost,
      this.costMultiplier,
      purchasesUntilHardcap
    );
    if (costScaling.purchases <= 0) return false;

    Currency.infinityPoints.purchase(costScaling.totalCost);
    this.cost = this.cost.times(costScaling.totalCostMultiplier);
    // Because each ID purchase gives 10 IDs
    this.amount = this.amount.plus(10 * costScaling.purchases);
    this.baseAmount += 10 * costScaling.purchases;

    if (EternityChallenge(8).isRunning) {
      player.eterc8ids -= costScaling.purchases;
    }
    
    return true;
  }
}

/**
 * @function
 * @param {number} tier
 * @return {InfinityDimensionState}
 */
export const InfinityDimension = InfinityDimensionState.createAccessor();

export const InfinityDimensions = {
  /**
   * @type {InfinityDimensionState[]}
   */
  all: InfinityDimension.index.compact(),
  HARDCAP_PURCHASES: 2000000,

  unlockNext() {
    if (InfinityDimension(8).isUnlocked) return;
    this.next().unlock();
  },

  next() {
    if (InfinityDimension(8).isUnlocked)
      throw "All Infinity Dimensions are unlocked";
    return this.all.first(dim => !dim.isUnlocked);
  },

  resetAmount() {
    Currency.infinityPower.reset();
    for (const dimension of InfinityDimensions.all) {
      dimension.resetAmount();
    }
  },

  fullReset() {
    for (const dimension of InfinityDimensions.all) {
      dimension.fullReset();
    }
  },

  get capIncrease() {
    return Math.floor(Tesseracts.capIncrease());
  },

  get totalDimCap() {
    let tDc =this.HARDCAP_PURCHASES + this.capIncrease;
    if (player.timestudy.studies.includes(310)) tDc = tDc * (Math.max(Math.log10(Currency.replicanti.value.exponent),1))
    return tDc;
  },

  canBuy() {
    return !EternityChallenge(2).isRunning &&
      !EternityChallenge(10).isRunning &&
      (!EternityChallenge(8).isRunning || player.eterc8ids > 0);
  },

  canAutobuy() {
    return this.canBuy() && !EternityChallenge(8).isRunning;
  },

  tick(diff) {
    for (let tier = 8; tier > 1; tier--) {
      InfinityDimension(tier).produceDimensions(InfinityDimension(tier - 1), new Decimal(diff).div(10));
    }
    if (EternityChallenge(7).isRunning) {
      if (!NormalChallenge(10).isRunning) {
        InfinityDimension(1).produceDimensions(AntimatterDimension(7), diff);
      }
    } 
    else { 
      InfinityDimension(1).produceCurrency(Currency.infinityPower, diff);
    }

    player.requirementChecks.reality.maxID1 = player.requirementChecks.reality.maxID1
      .clampMin(InfinityDimension(1).amount);
  },

  tryAutoUnlock() {
    if (!EternityMilestone.autoUnlockID.isReached || InfinityDimension(8).isUnlocked) return;
    for (const dimension of this.all) {
      // If we cannot unlock this one, we can't unlock the rest, either
      if (!dimension.unlock()) break;
    }
  },

  // Called from "Max All" UI buttons and nowhere else
  buyMax() {
    // Try to unlock dimensions
    const unlockedDimensions = this.all.filter(dimension => dimension.unlock());

    // Try to buy single from the highest affordable new dimensions
    unlockedDimensions.slice().reverse().forEach(dimension => {
      if (dimension.purchases === 0) dimension.buySingle();
    });

    // Try to buy max from the lowest dimension (since lower dimensions have bigger multiplier per purchase)
    unlockedDimensions.forEach(dimension => dimension.buyMax(false));
  },

  get powerConversionRate() {
    const x = Ra.unlocks.relicShardBoost.isUnlocked ? 1+(Math.max(1, Decimal.max(Currency.relicShards.value,1).log10()) / 1000) : 0;
    const y = Ra.unlocks.improvedIpowConversion.isUnlocked ? Math.log10(Math.max(Tesseracts.effectiveCount / 3.33,1)) : 0; //hpefully won't inflate if we softcap or put scaling in

    const z = Ra.unlocks.infinityPowerConversionBoost.isUnlocked ? 0.25 * Math.floor(Ra.pets.laitela.level / 10) : 0;
    const m = TimeStudy(402).effectOrDefault(0);
    let multiplier = PelleRifts.paradox.milestones[2].effectOrDefault(1);
    if (player.mending.corruptionChallenge.corruptedMend) {
      multiplier /= (corruptionPenalties.galWeak.hiddenEight[player.mending.corruption[3]])
    }
    let w = (7 + getAdjustedGlyphEffect("infinityrate") + PelleUpgrade.infConversion.effectOrDefault(0) + x + y + z + m) * multiplier;
    /*if (w > 8){
      w /= 8;
      w **= 0.01;
      w *= 8;
    }*/
    return w;
  }
};
