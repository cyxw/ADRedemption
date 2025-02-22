import { BitUpgradeState, GameMechanicState } from "../../game-mechanics";
import { MendingUpgrade } from "../../mending-upgrades";
import { Quotes } from "../quotes";
import { normalTimeStudies } from "../../secret-formula/eternity/time-studies/normal-time-studies";
import { DC } from "../../constants";
import { CorruptionUpgrade } from "../../corruption-upgrades";

const ts306 = normalTimeStudies.find(obj => obj.id === 306);


class RaUnlockState extends BitUpgradeState {
  get bits() { return player.celestials.ra.unlockBits; }
  set bits(value) { player.celestials.ra.unlockBits = value; }

  get modBits() { return player.celestials.ra.modUnlockBits; }
  set modBits(value) { player.celestials.ra.modUnlockBits = value; }

  get disabledByPelle() {
    return Pelle.isDoomed && this.config.disabledByPelle;
  }

  get isEffectActive() {
    return this.isUnlocked && !this.disabledByPelle;
  }

  get requirementText() {
    const pet = this.pet.name;
    return this.level === 1
      ? `Unlock ${pet}`
      : `Get ${pet} to level ${this.level}`;
  }

  get reward() {
    return typeof this.config.reward === "function"
      ? this.config.reward()
      : this.config.reward;
  }

  get displayIcon() {
    return this.disabledByPelle ? `<span class="fas fa-ban"></span>` : this.config.displayIcon;
  }

  get pet() {
    return Ra.pets[this.config.pet];
  }

  get level() {
    return this.config.level;
  }

  get canBeUnlocked() {
    //alright here you are
    if(this.pet.id == 'laitela'){
      if(this.id == 20 && player.celestials.ra.permanentMemories.lai50) return true;
      if(this.id == 21 && player.celestials.ra.permanentMemories.lai65) return true;
    };
    if(this.pet.id == 'ra' && this.id == 30 && player.celestials.ra.permanentMemories.ra2) return true;
    //ends
    return this.pet.level >= this.level && !this.isUnlocked;
  }

  onUnlock() {
    this.config.onUnlock?.();
  }
}

const unlocks = mapGameDataToObject(
  GameDatabase.celestials.ra.unlocks,
  config => new RaUnlockState(config)
);

class RaPetState extends GameMechanicState {
  get data() {
    return player.celestials.ra.pets[this.id];
  }

  get name() {
    return this.config.name;
  }

  get chunkGain() {
    return this.config.chunkGain;
  }

  get memoryGain() {
    return this.config.memoryGain;
  }

  get secondaryMemoryChunkGain(){
    return this.config.secondaryMemoryChunkGain;
  }

  get color() {
    return this.config.color;
  }

  get requiredUnlock() {
    return this.config.requiredUnlock?.();
  }

  get rawMemoryChunksPerSecond() {
    return this.config.rawMemoryChunksPerSecond();
  }

  get memoryProductionMultiplier() {
    return this.config.memoryProductionMultiplier();
  }

  get isUnlocked() {
    return this.requiredUnlock === undefined || this.requiredUnlock.isUnlocked;
  }

  get isCapped() {
    return this.level >= Ra.levelCap;
  }

  get level() {
    return this.isUnlocked ? this.data.level : 0;
  }

  set level(value) {
    this.data.level = value;
  }

  get memories() {
    return this.data.memories;
  }

  set memories(value) {
    this.data.memories = Math.min(value, 1e300);
  }

  get memoryChunks() {
    return this.data.memoryChunks;
  }

  set memoryChunks(value) {
    this.data.memoryChunks = Math.min(1e300, value);
  }

  get requiredMemories() {
    return Ra.requiredMemoriesForLevel(this, this.level);
  }

  get memoryChunksPerSecond() {
    if (!this.canGetMemoryChunks) return 0;
    let res = this.rawMemoryChunksPerSecond * this.chunkUpgradeCurrentMult *
      Math.max(Effects.product(Ra.unlocks.continuousTTBoost.effects.memoryChunks, GlyphSacrifice.reality), 1);
    if (this.hasRemembrance) res *= Ra.remembrance.multiplier;
    else if (Ra.petWithRemembrance) res *= Ra.remembrance.nerf;
    res *= WarpUpgrade(5).effectOrDefault(1);
    if (Ra.unlocks.raXP.isUnlocked) res *= Math.log10((Math.max(Currency.imaginaryMachines.value, 1)));
    if (Ra.unlocks.pelleXP.isUnlocked){
      res *= (Math.log10(player.records.bestReality.remWithoutGG + 1) / 1.6667) + 1;
    }
    if (!Ra.isRunning && Ra.unlocks.generateMemChunksOutOfRasReality.isUnlocked) res /= 100;
    return res;
  }

  get canGetMemoryChunks() {
    return this.isUnlocked && (Ra.isRunning || (this.id === "pelle" && Pelle.isDoomed) || Ra.unlocks.generateMemChunksOutOfRasReality.isUnlocked) && this.level < Ra.levelCap;
  }

  get hasRemembrance() {
    if (Ra.unlocks.remembranceAlwaysActiveAndShopUnlock.isUnlocked) return true;
    return Ra.petWithRemembrance === this.name;
  }

  get memoryUpgradeCurrentMult() {
    return Math.pow(1.3, this.data.memoryUpgrades);
  }

  get chunkUpgradeCurrentMult() {
    return Math.pow(1.5, this.data.chunkUpgrades);
  }

  get memoryUpgradeCost() {
    return 1000 * Math.pow(5, this.data.memoryUpgrades);
  }

  get chunkUpgradeCost() {
    return 5000 * Math.pow(25, this.data.chunkUpgrades);
  }

  get canBuyMemoryUpgrade() {
    return this.memoryUpgradeCost <= this.memories;
  }

  get canBuyChunkUpgrade() {
    return this.chunkUpgradeCost <= this.memories;
  }

  get memoryUpgradeCapped() {
    return this.memoryUpgradeCost >= 0.5 * Ra.requiredMemoriesForLevel(this, Ra.levelCap - 1);
  }

  get chunkUpgradeCapped() {
    return this.chunkUpgradeCost >= 0.5 * Ra.requiredMemoriesForLevel(this, Ra.levelCap - 1);
  }

  purchaseMemoryUpgrade() {
    if (!this.canBuyMemoryUpgrade || this.memoryUpgradeCapped) return;

    if(this.spendsMemories) this.memories -= this.memoryUpgradeCost;
    this.data.memoryUpgrades++;
  }

  purchaseChunkUpgrade() {
    if (!this.canBuyChunkUpgrade || this.chunkUpgradeCapped) return;

    if(this.spendsMemories) this.memories -= this.chunkUpgradeCost;
    this.data.chunkUpgrades++;
  }

  levelUp() {
    if (this.memories < this.requiredMemories) return;
    if(this.id === 'pelle' && this.level === 99 && Ra.totalPetLevel != 699) return;

    if(this.spendsMemories) this.memories -= this.requiredMemories;
    this.level++;
    Ra.checkForUnlocks();
  }

  get spendsMemories() {
    return !Ra.unlocks.upgradesDontSpendMems.isUnlocked;
  }

  get unlocks() {
    return Ra.unlocks.all
      .filter(x => x.pet === this)
      .sort((a, b) => a.level - b.level);
  }

  tick(realDiff, generateChunks) {
    const seconds = realDiff / 1000;
    const newMemoryChunks = generateChunks
      ? seconds * this.memoryChunksPerSecond
      : 0;
    // Adding memories from half of the gained chunks this tick results in the best mathematical behavior
    // for very long simulated ticks
    let memsPerSecond = Math.pow((this.memoryChunks + newMemoryChunks / 2) * Ra.productionPerMemoryChunk *
      this.memoryUpgradeCurrentMult * this.shopMemMultEffect, MendingUpgrade(15).isBought ? 1.5 : 1) * (Pelle.isDoomed && Ra.unlocks.boostMemoryGain.isUnlocked ? 500 : 1);
    if(CorruptionUpgrade(1).isBought){switch(Ra.currentCelestial){
      case 1: if(this.id=='teresa') memsPerSecond *= 1500;break;
      case 2: if(this.id=='effarig') memsPerSecond *= 1500;break;
      case 3: if(this.id=='enslaved') memsPerSecond *= 1500;break;
      case 4: if(this.id=='v') memsPerSecond *= 1500;break;
      case 5: if(this.id=='ra') memsPerSecond *= 1500;break;
      case 6: if(this.id=='laitela') memsPerSecond *= 1500;break;
      case 7: if(this.id=='pelle') memsPerSecond *= 1500;break;
    };}
    let newMemories = seconds * memsPerSecond;
    this.memoryChunks += newMemoryChunks;
    this.memories += newMemories;
  }

  reset() {
    let x = MendingMilestone.ten.isReached ? 10 : 1;
    //this.data.level = 1;
    Ra.pets.teresa.level = x;
    Ra.pets.effarig.level = x;
    Ra.pets.enslaved.level = x;
    Ra.pets.v.level = x;
    Ra.pets.ra.level = 1;
    Ra.pets.laitela.level = 1;
    Ra.pets.pelle.level = 1;
    this.data.memories = 0;
    this.data.memoryChunks = 0;
    this.data.memoryUpgrades = 0;
    this.data.chunkUpgrades = 0;
  }

  get shopMemMultEffect(){
    return RaUpgrade[`inc${this.id.charAt(0).toUpperCase()}${this.id.substring(1)}XPGain`].effectValue;
  }

  get shopWeakenScalingEffect(){
    return RaUpgrade[`weaken${this.id.charAt(0).toUpperCase()}${this.id.substring(1)}Scaling`].effectValue;
  }
}

const pets = mapGameDataToObject(
  GameDatabase.celestials.ra.pets,
  config => new RaPetState(config)
);

export const Ra = {
  displayName: "Ra",
  possessiveName: "Ra's",
  alchauto: 0,
  unlocks,
  pets,
  remembrance: {
    get multiplier(){
      if(Ra.unlocks.remembranceBoost.isUnlocked) return 75; 
      return 5;
    },
    get nerf(){
      if(Ra.unlocks.remembranceAlwaysActiveAndShopUnlock.isUnlocked) return 1; 
      return 0.5;
    },
    requiredLevels: 20,
    get isUnlocked() {
      return Ra.totalPetLevel >= this.requiredLevels;
    }
  },
  // Dev/debug function for easier testing
  reset() {
    const data = player.celestials.ra;
    data.unlockBits = 0;
    data.modUnlockBits = [0, 0, 0];
    data.run = false;
    data.charged = new Set();
    data.disCharge = false;
    data.breakCharged = new Set();
    data.breakDischarge = false;
    data.peakGamespeed = new Decimal(1);
    for (const pet of Ra.pets.all) pet.reset();
  },
  memoryTick(realDiff, generateChunks) {
    if (!this.isUnlocked) return;
    for (const pet of Ra.pets.all) pet.tick(realDiff, generateChunks);
  },
  get productionPerMemoryChunk() {
    let res = Effects.product(Ra.unlocks.continuousTTBoost.effects.memories, Achievement(168), Achievement(195));
    for (const pet of Ra.pets.all) {
      if (pet.isUnlocked) res = new Decimal(res).times(pet.memoryProductionMultiplier);
    }
    if (MendingMilestone.one.isReached) res = new Decimal(res).times(25);
    if (player.timestudy.studies.includes(306)) res = new Decimal(res).times(ts306.effect());
    res = res.timesEffectOf(WarpUpgrade(2)).times(VUnlocks.vAchRa.effectOrDefault(1));
    
    return res.toNumber();
  },
  get memoryBoostResources() {
    const boostList = [];
    for (const pet of Ra.pets.all) {
      if (pet.memoryProductionMultiplier !== 1) boostList.push(pet.memoryGain);
    }
    if (Achievement(168).isUnlocked) boostList.push("Achievement 168");
    if (Ra.unlocks.continuousTTBoost.canBeApplied) boostList.push("current TT");
    if (MendingMilestone.one.isReached) boostList.push("Mending Milestone 1");
    if (MendingUpgrade(15).isBought) boostList.push("Mending Upgrade 15");

    if (boostList.length === 1) return `${boostList[0]}`;
    if (boostList.length === 2) return `${boostList[0]} and ${boostList[1]}`;
    return `${boostList.slice(0, -1).join(", ")}, and ${boostList[boostList.length - 1]}`;
  },
  // So let's make Ra currency work? --sxy
  raPointsGain(diff) {
    if(!Ra.isRunning) return new Decimal(0);
    if(!Ra.unlocks.remembranceAlwaysActiveAndShopUnlock.isUnlocked) return new Decimal(0);
    let ticktime = diff/1000;
    let base = Math.max(player.dimensionBoosts - 2.5e9,0)/1e8;
    let powered = Decimal.pow(10,base).minus(1);
    let GainPerSec = new Decimal(powered.times(ticktime));
    return GainPerSec;
  },
  raGainPointLoop(diff){
    player.celestials.ra.raPoints = player.celestials.ra.raPoints.plus(Ra.raPointsGain(diff));
  },
  // Why the rebuyable of ra shop has complex name wtf --sxy
  
  // This is the exp required ON "level" in order to reach "level + 1"
  requiredMemoriesForLevel(pet, level) {
    if (level >= Ra.levelCap) return Infinity;
    let perMemScaling = 1
    let fixCostMulti = 1
    if (level >= 25) {fixCostMulti = 1e44}
    if (level >= 30) {perMemScaling = 1.35;fixCostMulti = 1e48}
    if (level >= 40) {perMemScaling = 1.35} 
    if (level >= 50) {perMemScaling = 1.5;fixCostMulti = 1e50} 
    if (level >= 65) {perMemScaling = 1.6} 
    if (level >= 75) {perMemScaling = 1.75;fixCostMulti = 1e60} 
    if (level >= 90) {perMemScaling = 2.25;fixCostMulti = 1e80} 
    const adjustedLevel = level + Math.pow(level, 2) / 10;
    const post15Scaling = Math.pow(1.5, Math.max(0, level - 15));
    const post25Scaling = Math.pow(3, Math.max(0, level-25));
    let primeAnswer = Math.pow(adjustedLevel, 5.52) * post15Scaling * post25Scaling * 1e6;
    //if (level>=90) primeAnswer=primeAnswer*1e300;//temporary scale for balacing
    primeAnswer = primeAnswer / pet.shopWeakenScalingEffect;
    return Math.floor(Math.pow(primeAnswer, perMemScaling) * fixCostMulti);
  },
  // Returns a string containing a time estimate for gaining a specific amount of exp (UI only)
  timeToGoalString(pet, expToGain) {
    //This function did its job well, the 0ms issue is due to Number precision lost.
    //If the issue did need to fix, All ra should be decimalised.
    //Which is dangerous and I suggest pushing the work later
    //sxy

    //^ it might just be due to the formula was wrong? XD
    //asw

    //^ your version of this function is still chaos lmao
    //and since this function needs decimalised anyway I'll rewrite this
    //sxy

    // Quadratic formula for growth (uses constant growth for a = 0)
    /*const a = Enslaved.isStoringRealTime
      ? 0
      : Ra.productionPerMemoryChunk * pet.memoryUpgradeCurrentMult * pet.memoryChunksPerSecond * pet.shopMemMultEffect * ((Pelle.isDoomed && Ra.unlocks.boostMemoryGain.isUnlocked) ? 500 : 1);
    const b = Ra.productionPerMemoryChunk * pet.memoryUpgradeCurrentMult * pet.memoryChunks * pet.shopMemMultEffect * ((Pelle.isDoomed && Ra.unlocks.boostMemoryGain.isUnlocked) ? 500 : 1);
    //I will just leave HU1 code here haha --sxy
    /*if(CorruptionUpgrade(1).isBought){switch(Ra.currentCelestial){
      case 1: if(this.id=='teresa') memsPerSecond *= 1500;break;
      case 2: if(this.id=='effarig') memsPerSecond *= 1500;break;
      case 3: if(this.id=='enslaved') memsPerSecond *= 1500;break;
      case 4: if(this.id=='v') memsPerSecond *= 1500;break;
      case 5: if(this.id=='ra') memsPerSecond *= 1500;break;
      case 6: if(this.id=='laitela') memsPerSecond *= 1500;break;
      case 7: if(this.id=='pelle') memsPerSecond *= 1500;break;
    };}*/
    /*const c = -expToGain;
    const estimate = a === 0
      ? (MendingUpgrade(15).isBought 
      ? -c / Math.pow(b, 1.5)
      : -c / b)
      : (MendingUpgrade(15).isBought
      // derivation for the formula in latex(paste this into any latex editor and compile it) - asw
      // \int_0^t (at + b)^{1.5} dt + c = 0 \\
      // \left[\frac{2(at + b)^{2.5}}{5a}\right]_0^t + c = 0 \\
      // \frac{2(at + b)^{2.5}}{5a} - \frac{2b^{2.5}}{5a} + c = 0 \\
      // 2(at + b)^{2.5} - 2b^{2.5} + 5ac = 0 \\
      // (at + b)^{2.5} - b^{2.5} + \frac{5ac}{2} = 0 \\
      // (at + b)^{2.5} + \frac{5ac}{2} = b^{2.5} \\
      // (at + b)^{2.5} = b^{2.5} - \frac{5ac}{2} \\
      // at + b = (b^{2.5} - \frac{5ac}{2})^{0.4} \\
      // at = (b^{2.5} - \frac{5ac}{2})^{0.4} - b \\
      // t = \frac{(b^{2.5} - \frac{5ac}{2})^{0.4} - b}{a}
      ? (Math.pow(Math.pow(b, 2.5) - 5 * a * c / 2, 0.4) - b) / a
      : (Math.sqrt(Math.pow(b, 2) - 2 * a * c) - b) / (a));*/


      //decimalised rewritten version of this function--sxy

      // full rewrite
      // multiplier can be divided from total
      // -- wyxkk

      let power = MendingUpgrade(15).isBought ? 1.5 : 1;

      let multiplierInPower = new Decimal(Ra.productionPerMemoryChunk * pet.memoryUpgradeCurrentMult * pet.shopMemMultEffect);

      let multiplierOutPower = new Decimal(1);
      if(Pelle.isDoomed && Ra.unlocks.boostMemoryGain.isUnlocked){
        multiplierOutPower = multiplierOutPower.times(500);
      }
      let HUavaliable = false;
      if(CorruptionUpgrade(1).isBought){switch(Ra.currentCelestial){
        case 1: if(pet.id=='teresa') HUavaliable = true;break;
        case 2: if(pet.id=='effarig') HUavaliable = true;break;
        case 3: if(pet.id=='enslaved') HUavaliable = true;break;
        case 4: if(pet.id=='v') HUavaliable = true;break;
        case 5: if(pet.id=='ra') HUavaliable = true;break;
        case 6: if(pet.id=='laitela') HUavaliable = true;break;
        case 7: if(pet.id=='pelle') HUavaliable = true;break;
      };}
      if(HUavaliable){
        multiplierOutPower = multiplierOutPower.times(1500);
      }

      let a = new Decimal(pet.memoryChunksPerSecond);
      if(Enslaved.isStoringRealTime) a = new Decimal(0);
      let b = new Decimal(pet.memoryChunks);
      let c = new Decimal(expToGain).div(multiplierInPower.pow(power)).div(multiplierOutPower);

      // now to solve \int_0^x (at+b)^power dt = c
      let estimateDecimal = new Decimal('2e308');
      if(a.eq(0)){
        estimateDecimal = c.div(b.pow(power));
      } else {
        // estimateDecimal = c.times(a).times(power+1).plus(b.pow(power+1)).pow(1/(power+1)).minus(b).div(a);
        // the add will cause precision lost
        // a fix, by using ax to approximate (1+x)^a-1 when x is small
        let midResult = c.times(a).times(power+1).div(b.pow(power+1));
        let midResult2 = new Decimal(0);
        if(midResult.gt(1e-6)){
          midResult2 = midResult.plus(1).pow(1/(power+1)).minus(1);
        } else { // the approximation is square precised, and 1e-12 level error is nothing
          midResult2 = midResult.times(1/(power+1));
        }
        estimateDecimal = b.div(a).times(midResult2);
      }

      //estimateDecimal = estimateDecimal.div(multiplierOutPower);
      //toNumber
      let estimate = estimateDecimal.toNumber();

    if (Number.isFinite(estimate)) {
      return `in ${TimeSpan.fromSeconds(new Decimal(estimate)).toStringShort()}`;
    }
    return "in an exteremely long time";
  },
  get totalPetLevel() {
    return this.pets.all.map(pet => (pet.isUnlocked ? pet.level : 0)).sum();
  },
  get levelCap() {
    return MendingUpgrade(19).isBought ? 100 : 25;
  },
  get maxTotalPetLevel() {
    return this.levelCap * this.pets.all.length;
  },
  checkForUnlocks() {
    if (!VUnlocks.raUnlock.canBeApplied && !MendingUpgrade(19).isBought) return;
    for (const unl of Ra.unlocks.all) {
      unl.unlock();
    }

    Ra.checkForQuotes();
  },
  checkForQuotes() {
    for (const quote of Ra.quotes.all) {
      // Quotes without requirements will be shown in other ways
      if (quote.requirement) {
        quote.show();
      }
    }
  },
  initializeRun() {
    clearCelestialRuns();
    player.celestials.ra.run = true;
    this.quotes.realityEnter.show();
  },
  toggleMode() {
    player.celestials.ra.activeMode = !player.celestials.ra.activeMode;
  },
  // This gets widely used in lots of places since the relevant upgrade is "all forms of continuous non-dimension
  // production", which in this case is infinities, eternities, replicanti, dilated time, and time theorem generation.
  // It also includes the 1% IP time study, Teresa's 1% EP upgrade, and the charged RM generation upgrade. Note that
  // removing the hardcap of 10 may cause runaways.
  theoremBoostFactor() {
    return Math.min(1000, Math.max(0, Currency.timeTheorems.value.pLog10() - 850) / 500 + 10, Math.max(0, Currency.timeTheorems.value.pLog10() - 350) / 50);
  },
  get isUnlocked() {
    return V.spaceTheorems >= 36;
  },
  get isRunning() {
    return player.celestials.ra.run;
  },
  get totalCharges() {
    return Ra.unlocks.chargedInfinityUpgrades.effectOrDefault(0);
  },
  get chargesLeft() {
    return this.totalCharges - player.celestials.ra.charged.size;
  },
  get totalBreakCharges() {
    return Ra.unlocks.chargedBreakInfinityUpgrades.effectOrDefault(0);
  },
  get breakChargesLeft(){
    return this.totalBreakCharges - player.celestials.ra.breakCharged.size;
  },
  get canBuyTriad() {
    return Ra.unlocks.unlockHardV.canBeApplied;
  },
  get petWithRemembrance() {
    return player.celestials.ra.petWithRemembrance;
  },
  set petWithRemembrance(name) {
    player.celestials.ra.petWithRemembrance = name;
  },
  updateAlchemyFlow(realityRealTime) {
    const perSecond = 1000 / realityRealTime;
    for (const resource of AlchemyResources.all) {
      resource.ema.addValue((resource.amount - resource.before) * perSecond);
      resource.before = resource.amount;
    }
  },
  applyAlchemyReactions(realityRealTime) {
    if (!Ra.unlocks.effarigUnlock.canBeApplied) return;
    const sortedReactions = AlchemyReactions.all
      .compact()
      .sort((r1, r2) => r2.priority - r1.priority);
    for (const reaction of sortedReactions) {
      reaction.combineReagents();
    }
    this.updateAlchemyFlow(realityRealTime);
  },
  applyAlchemyReactionsAuto() {
    if (!Ra.unlocks.effarigUnlock.canBeApplied) return;
    Ra.alchauto += 1
    if (Ra.alchauto >= 15) {
      Ra.alchauto -= 15
      Ra.applyAlchemyReactions(1000)
    }
  },
  get alchemyResourceCap() {
    return Ra.unlocks.alchSetToCapAndCapIncrease.isUnlocked ? 25000 + (5 * player.celestials.ra.pets["effarig"].level) + CorruptionUpgrade(14).effectOrDefault(0) : 25000;
  },
  get momentumValue() {
    const hoursFromUnlock = TimeSpan.fromMilliseconds(player.celestials.ra.momentumTime).totalHours;
    return Decimal.clampMax(hoursFromUnlock.times(0.005).add(1), AlchemyResource.momentum.effectValue).toNumber();
  },
  get continuumActive() {
    return Ra.unlocks.continuumAffectsIDsAndTDs.isUnlocked && Laitela.continuumActive;
  },
  get currentCelestial(){ //this returns the current celestials' number. Teresa = 1, etc.
    switch(true){
      case(Teresa.isRunning):
        return 1;
      case(Effarig.isRunning):
        return 2;
      case(Enslaved.isRunning):
        return 3;
      case(V.isRunning):
        return 4;
      case(Ra.isRunning):
        return 5;
      case(Laitela.isRunning):
        return 6;
      case(Pelle.isDoomed):
        return 7;
      default:
        return 0;
    }
  },
  quotes: Quotes.ra,
  symbol: "<i class='fas fa-sun'></i>"
};

export const GlyphAlteration = {
  // Adding a secondary effect to some effects
  get additionThreshold() {
    return DC.E36;
  },
  // One-time massive boost of a single effect
  get empowermentThreshold() {
    return DC.E43;
  },
  // Scaling boost from sacrifice quantity
  get boostingThreshold() {
    return DC.E60;
  },
  getSacrificePower(type) {
    if (Pelle.isDisabled("alteration")) return 0;
    const sacPower = player.reality.glyphs.sac[type];
    if (sacPower === undefined) {
      throw new Error("Unknown sacrifice type");
    }
    return sacPower;
  },
  get isUnlocked() {
    if (Pelle.isDisabled("alteration")) return false;
    return Ra.unlocks.alteredGlyphs.canBeApplied;
  },
  isAdded(type) {
    return this.isUnlocked && this.getSacrificePower(type).gte(this.additionThreshold);
  },
  isEmpowered(type) {
    return this.isUnlocked && this.getSacrificePower(type).gte(this.empowermentThreshold);
  },
  isBoosted(type) {
    return this.isUnlocked && this.getSacrificePower(type).gte(this.boostingThreshold);
  },
  sacrificeBoost(type) {
    const capped = Decimal.clampMax(this.getSacrificePower(type), GlyphSacrificeHandler.maxSacrificeForEffects);
    return Decimal.log10(capped.div(this.boostingThreshold).clampMin(1)) / 2;
  },
  baseAdditionColor(isDark = Theme.current().isDark()) {
    return isDark ? "#CCCCCC" : "black";
  },
  baseEmpowermentColor(isDark = Theme.current().isDark()) {
    return isDark ? "#EEEE30" : "#C6C610";
  },
  baseBoostColor(isDark = Theme.current().isDark()) {
    return isDark ? "#60DDDD" : "#28BDBD";
  },
  getAdditionColor(type) {
    const isDark = CosmeticGlyphTypes[type].currentColor.bg === "black";
    return this.isAdded(type) ? this.baseAdditionColor(isDark) : undefined;
  },
  getEmpowermentColor(type) {
    const isDark = CosmeticGlyphTypes[type].currentColor.bg === "black";
    return this.isEmpowered(type) ? this.baseEmpowermentColor(isDark) : undefined;
  },
  getBoostColor(type) {
    const isDark = CosmeticGlyphTypes[type].currentColor.bg === "black";
    return this.isBoosted(type) ? this.baseBoostColor(isDark) : undefined;
  }
};

EventHub.logic.on(GAME_EVENT.TAB_CHANGED, () => {
  if (Tab.celestials.ra.isOpen) Ra.quotes.unlock.show();
});
