export const RECEIVER_DISPLAY_NAME_MAP: { [key: string]: string } = {
  // GPS
  'GZLI2P': 'NPLI_GPS_CV',
  'GZLMB1': 'Blr_GPS1_CV',
  'GZLMB2': 'Blr_GPS2_CV',
  'GZLMA1': 'Ahm_GPS1_CV',
  'GZLMA2': 'Ahm_GPS2_CV',
  'GZLMF1': 'Frd_GPS1_CV',
  'GZLMF2': 'Frd_GPS2_CV',
  'GZLMO1': 'Bhu_GPS1_CV',
  'GZLMO2': 'Bhu_GPS2_CV',
  'GZLMG1': 'Gwh_GPS1_CV',
  'GZLMG2': 'Gwh_GPS2_CV',
  'GZDRC1': 'DRC_GPS1_CV',
  'GZDRC2': 'DRC_GPS2_CV',
  // NAVIC
  'IRNPLI': 'NPLI_Nav_CV',
  'IRLMB1': 'Blr_Nav1_CV',
  'IRLMB2': 'Blr_Nav2_CV',
  'IRLMA1': 'Ahm_Nav1_CV',
  'IRLMA2': 'Ahm_Nav2_CV',
  'IRLMF1': 'Frd_Nav1_CV',
  'IRLMF2': 'Frd_Nav2_CV',
  'IRLMO1': 'Bhu_Nav1_CV',
  'IRLMO2': 'Bhu_Nav2_CV',
  'IRLMG1': 'Gwh_Nav1_CV',
  'IRLMG2': 'Gwh_Nav2_CV',
  'IRDRC1': 'DRC_Nav1_CV',
  'IRDRC2': 'DRC_Nav2_CV'
};

export function getReceiverDisplayName(code: string): string {
  return RECEIVER_DISPLAY_NAME_MAP[code] || code;
}
