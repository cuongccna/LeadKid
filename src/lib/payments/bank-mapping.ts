/**
 * Mapping from SePay/CITAD bank codes to VietQR BIN codes and display names.
 * CITAD codes are used by SePay, but VietQR API requires 6-digit BIN codes.
 */

export interface BankMapping {
  citadCode: string;
  vietQrBin: string;
  name: string;
  shortName: string;
}

export const BANK_MAPPINGS: BankMapping[] = [
  { citadCode: '01311001', vietQrBin: '970422', name: 'Ngân hàng TMCP Quân đội', shortName: 'MB Bank' },
  { citadCode: '01203001', vietQrBin: '970436', name: 'Ngân hàng TMCP Ngoại thương Việt Nam', shortName: 'Vietcombank' },
  { citadCode: '01201001', vietQrBin: '970415', name: 'Ngân hàng TMCP Công thương Việt Nam', shortName: 'VietinBank' },
  { citadCode: '01202001', vietQrBin: '970418', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', shortName: 'BIDV' },
  { citadCode: '01204009', vietQrBin: '970405', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', shortName: 'Agribank' },
  { citadCode: '01310001', vietQrBin: '970407', name: 'Ngân hàng TMCP Kỹ thương Việt Nam', shortName: 'Techcombank' },
  { citadCode: '01302001', vietQrBin: '970426', name: 'Ngân hàng TMCP Hàng Hải Việt Nam', shortName: 'MSB' },
  { citadCode: '01205004', vietQrBin: '970403', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', shortName: 'Sacombank' },
  { citadCode: '01305001', vietQrBin: '970431', name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam', shortName: 'Eximbank' },
  { citadCode: '01314001', vietQrBin: '970441', name: 'Ngân hàng TMCP Quốc tế Việt Nam', shortName: 'VIB' },
  { citadCode: '01308001', vietQrBin: '970400', name: 'Ngân hàng TMCP Sài Gòn Công Thương', shortName: 'Saigonbank' },
  { citadCode: '01313007', vietQrBin: '970409', name: 'Ngân hàng TMCP Bắc Á', shortName: 'Bac A Bank' },
  { citadCode: '01323001', vietQrBin: '970425', name: 'Ngân hàng TMCP An Bình', shortName: 'ABBank' },
  { citadCode: '01360002', vietQrBin: '970412', name: 'Ngân hàng TMCP Đại Chúng Việt Nam', shortName: 'PVcomBank' },
  { citadCode: '01213007', vietQrBin: '970419', name: 'Ngân hàng TMCP Bảo Việt', shortName: 'Bao Viet Bank' },
  { citadCode: '01206001', vietQrBin: '970437', name: 'Ngân hàng TMCP Phát triển TP.HCM', shortName: 'HDBank' },
  { citadCode: '01217001', vietQrBin: '970438', name: 'Ngân hàng TMCP Bưu điện Liên Việt', shortName: 'LienVietPostBank' },
  { citadCode: '01334001', vietQrBin: '970434', name: 'Ngân hàng TMCP Sài Gòn', shortName: 'SCB' },
  { citadCode: '01339001', vietQrBin: '970430', name: 'Ngân hàng TMCP Tiên Phong', shortName: 'TPBank' },
  { citadCode: '01352002', vietQrBin: '970446', name: 'Ngân hàng TMCP Quốc Dân', shortName: 'NCB' },
  { citadCode: '01341001', vietQrBin: '970432', name: 'Ngân hàng TMCP Xăng dầu Petrolimex', shortName: 'PG Bank' },
  { citadCode: '01307001', vietQrBin: '970416', name: 'Ngân hàng TMCP Á Châu', shortName: 'ACB' },
  { citadCode: '01208001', vietQrBin: '970448', name: 'Ngân hàng TMCP Phương Đông', shortName: 'OCB' },
  { citadCode: '01319001', vietQrBin: '970414', name: 'Ngân hàng TMCP Đại Dương', shortName: 'OceanBank' },
  { citadCode: '01221001', vietQrBin: '970440', name: 'Ngân hàng TMCP Phát triển Nhà TP.HCM', shortName: 'HD Bank' },
  { citadCode: '01209001', vietQrBin: '970454', name: 'Ngân hàng TMCP Bản Việt', shortName: 'Viet Capital Bank' },
  { citadCode: '01309001', vietQrBin: '970433', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', shortName: 'VPBank' },
];

export function getBankByCitad(citadCode: string): BankMapping | undefined {
  return BANK_MAPPINGS.find((b) => b.citadCode === citadCode);
}

export function getVietQrBin(citadCode: string): string {
  return getBankByCitad(citadCode)?.vietQrBin || citadCode;
}

export function getBankName(citadCode: string): string {
  return getBankByCitad(citadCode)?.shortName || citadCode;
}
