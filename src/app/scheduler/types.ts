export interface Rule {
  rule: string;
  description: string;
  player: string;
  date: Date;
  notes?: string | null;
}

export interface ScheduleDay {
  date: Date,
  sharedDay: boolean,
  rule: Rule,
  allRules: Rule[],
  playlistIndices: number[]
}