export interface CharacterData {
  character: string;
  pinyin: string;
  definition: string;
  confidence?: number;
}

export interface SentenceItem {
  id: string;
  character: string;
  pinyin: string;
  definition: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
}

export type CameraState = 'loading' | 'active' | 'processing' | 'error' | 'disabled';

export interface AppState {
  sentence: SentenceItem[];
  isScanning: boolean;
  isProcessing: boolean;
  lastScanned: CharacterData | null;
  activeCard: CharacterData | null;
}
