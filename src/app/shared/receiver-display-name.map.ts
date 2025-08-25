export const RECEIVER_DISPLAY_NAME_MAP: { [key: string]: string } = {
  // GPS
  'GZLI2P': 'NPLI_GPS',
  'GZLMB1': 'Blr_GPS1',
  'GZLMB2': 'Blr_GPS2',
  'GZLMA1': 'Ahm_GPS1',
  'GZLMA2': 'Ahm_GPS2',
  'GZLMF1': 'Frd_GPS1',
  'GZLMF2': 'Frd_GPS2',
  'GZLMO1': 'Bhu_GPS1',
  'GZLMO2': 'Bhu_GPS2',
  'GZLMG1': 'Gwh_GPS1',
  'GZLMG2': 'Gwh_GPS2',
  'GZDRC1': 'DRC_GPS1',
  'GZDRC2': 'DRC_GPS2',
  // NAVIC
  'IRNPLI': 'NPLI_Nav',
  'IRLMB1': 'Blr_Nav1',
  'IRLMB2': 'Blr_Nav2',
  'IRLMA1': 'Ahm_Nav1',
  'IRLMA2': 'Ahm_Nav2',
  'IRLMF1': 'Frd_Nav1',
  'IRLMF2': 'Frd_Nav2',
  'IRLMO1': 'Bhu_Nav1',
  'IRLMO2': 'Bhu_Nav2',
  'IRLMG1': 'Gwh_Nav1',
  'IRLMG2': 'Gwh_Nav2',
  'IRDRC1': 'DRC_Nav1',
  'IRDRC2': 'DRC_Nav2'
};

export function getReceiverDisplayName(code: string): string {
  return RECEIVER_DISPLAY_NAME_MAP[code] || code;
}
