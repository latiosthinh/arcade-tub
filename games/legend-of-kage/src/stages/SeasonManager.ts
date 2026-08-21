import { Season } from '../types';

export interface SeasonTheme {
  season: Season;
  name: string;
  skyColorTop: string;
  skyColorBottom: string;
  canopyColor: string;
  particleColor: string[];
  particleType: 'sakura' | 'pollen' | 'maple' | 'snow';
  enemySpeedMultiplier: number;
}

export const SEASON_THEMES: Record<Season, SeasonTheme> = {
  spring: {
    season: 'spring',
    name: 'Spring — Cherry Blossom',
    skyColorTop: '#F8BBD0',
    skyColorBottom: '#FCE4EC',
    canopyColor: '#A5D6A7',
    particleColor: ['#F48FB1', '#FF80AB', '#FFFFFF'],
    particleType: 'sakura',
    enemySpeedMultiplier: 1.0,
  },
  summer: {
    season: 'summer',
    name: 'Summer — Deep Green',
    skyColorTop: '#81D4FA',
    skyColorBottom: '#E1F5FE',
    canopyColor: '#2E7D32',
    particleColor: ['#FFF59D', '#FFE082', '#A5D6A7'],
    particleType: 'pollen',
    enemySpeedMultiplier: 1.15,
  },
  autumn: {
    season: 'autumn',
    name: 'Autumn — Crimson Maple',
    skyColorTop: '#FFCC80',
    skyColorBottom: '#FFE0B2',
    canopyColor: '#D84315',
    particleColor: ['#E64A19', '#FF5722', '#FFA000'],
    particleType: 'maple',
    enemySpeedMultiplier: 1.3,
  },
  winter: {
    season: 'winter',
    name: 'Winter — Silent Snow',
    skyColorTop: '#B0BEC5',
    skyColorBottom: '#ECEFF1',
    canopyColor: '#78909C',
    particleColor: ['#FFFFFF', '#ECEFF1', '#CFD8DC'],
    particleType: 'snow',
    enemySpeedMultiplier: 1.45,
  },
};

export class SeasonManager {
  currentLoop = 1;
  currentSeason: Season = 'spring';

  getTheme(): SeasonTheme {
    return SEASON_THEMES[this.currentSeason];
  }

  advanceLoop(): { loop: number; season: Season } {
    this.currentLoop += 1;
    const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
    const nextIdx = (this.currentLoop - 1) % seasons.length;
    this.currentSeason = seasons[nextIdx];
    return { loop: this.currentLoop, season: this.currentSeason };
  }
}
