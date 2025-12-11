export interface IDAnalysisResult {
  idType: string;
  isIndianID: boolean;
  addressVisible: boolean;
  extractedAddress: string | null;
  confidenceScore: number;
  issueDetected: 'none' | 'wrong_side' | 'blur' | 'glare' | 'obscured' | 'not_an_id';
  userInstruction: string;
}

export enum AppState {
  IDLE = 'IDLE',
  CAMERA = 'CAMERA',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  SENDING = 'SENDING',
  SUCCESS = 'SUCCESS',
}
