import { AbilityType } from '../types';
import { CopyAbility } from './AbilityTypes';
import { SwordAbility } from './SwordAbility';
import { FireAbility } from './FireAbility';
import { IceAbility } from './IceAbility';
import { BeamAbility } from './BeamAbility';
import { CutterAbility } from './CutterAbility';
import { StoneAbility } from './StoneAbility';
import { SparkAbility } from './SparkAbility';
import { NeedleAbility } from './NeedleAbility';

export class AbilityRegistry {
  static create(type: AbilityType): CopyAbility {
    switch (type) {
      case 'sword':
        return new SwordAbility();
      case 'fire':
        return new FireAbility();
      case 'ice':
        return new IceAbility();
      case 'beam':
        return new BeamAbility();
      case 'cutter':
        return new CutterAbility();
      case 'stone':
        return new StoneAbility();
      case 'spark':
        return new SparkAbility();
      case 'needle':
        return new NeedleAbility();
    }
  }
}
