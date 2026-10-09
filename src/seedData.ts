export interface SeedRow {
  date: string;
  oldReg: string;
  newReg: string;
  type: 'Private' | 'Commercial';
  owner: string;
  party: string;
  receiptDate: string;
  receipt: number;
  insurance: number;
  fitness: number;
  permit: number;
  mvi: number;
  alt: number;
  other: number;
  status: string;
  notes: string;
  remarks: string;
  wf?: boolean[];
}

export const INITIAL_VRM_SEED: SeedRow[] = [
  {"date":"2026-07-02","oldReg":"KOS-9895","newReg":"","type":"Private","owner":"","party":"SH","receiptDate":"2026-07-02","receipt":1600,"insurance":0,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":7400,"status":"","notes":"","remarks":""},
  {"date":"2026-07-06","oldReg":"BJU-163","newReg":"AAFU-075","type":"Private","owner":"ANNAS","party":"SKT","receiptDate":"2026-07-07","receipt":17950,"insurance":4200,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":3500,"status":"","notes":"","remarks":""},
  {"date":"2026-07-06","oldReg":"BJL-593","newReg":"AAFU-072","type":"Private","owner":"SHALIL KHAN","party":"SKT","receiptDate":"2026-07-07","receipt":9250,"insurance":4200,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":3500,"status":"","notes":"","remarks":""},
  {"date":"2026-07-09","oldReg":"KPM-7888","newReg":"","type":"Private","owner":"ZOHAIB","party":"SKT","receiptDate":"2026-07-09","receipt":3100,"insurance":0,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":2400,"status":"","notes":"","remarks":""},
  {"date":"2026-07-09","oldReg":"JU-6703","newReg":"AAFW-983","type":"Commercial","owner":"ZAHOOR","party":"SKT","receiptDate":"2026-07-09","receipt":6300,"insurance":17700,"fitness":0,"permit":0,"mvi":6000,"alt":25000,"other":6000,"status":"","notes":"","remarks":"","wf":[true,false,false,false]},
  {"date":"2026-07-15","oldReg":"ADF-523","newReg":"","type":"Private","owner":"","party":"SH","receiptDate":"","receipt":0,"insurance":0,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":0,"status":"","notes":"","remarks":""},
  {"date":"2026-07-17","oldReg":"CK-3268","newReg":"AAGM-363","type":"Private","owner":"","party":"SH","receiptDate":"2026-07-18","receipt":17995,"insurance":2200,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":3200,"status":"","notes":"","remarks":""},
  {"date":"2026-07-20","oldReg":"CX-5366","newReg":"AAGN-341","type":"Private","owner":"","party":"SH","receiptDate":"2026-07-22","receipt":9200,"insurance":3900,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":3200,"status":"","notes":"","remarks":""},
  {"date":"2026-07-20","oldReg":"BKH-631","newReg":"AAGN-332","type":"Private","owner":"","party":"SH","receiptDate":"2026-07-22","receipt":7050,"insurance":3900,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":3200,"status":"","notes":"","remarks":""},
  {"date":"2026-07-20","oldReg":"ABV-491","newReg":"AAGQ-608","type":"Private","owner":"","party":"SH","receiptDate":"2026-07-23","receipt":10450,"insurance":3900,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":3200,"status":"","notes":"","remarks":""},
  {"date":"2026-07-20","oldReg":"AMV-086","newReg":"AAGT-980","type":"Private","owner":"","party":"SH","receiptDate":"2026-07-23","receipt":7550,"insurance":0,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":3200,"status":"","notes":"","remarks":""},
  {"date":"2026-07-24","oldReg":"KS-5159","newReg":"AAGN-245","type":"Commercial","owner":"","party":"SKT","receiptDate":"2026-07-25","receipt":7300,"insurance":9000,"fitness":0,"permit":8000,"mvi":0,"alt":0,"other":9950,"status":"","notes":"","remarks":"","wf":[true,false,false,false]},
  {"date":"2026-07-27","oldReg":"AABH-988","newReg":"AAHC-452","type":"Private","owner":"","party":"SH","receiptDate":"2026-07-30","receipt":7050,"insurance":2200,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":3200,"status":"","notes":"","remarks":""},
  {"date":"2026-07-27","oldReg":"AMJ-526","newReg":"AAGY-451","type":"Private","owner":"","party":"SH","receiptDate":"2026-07-28","receipt":11950,"insurance":0,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":3200,"status":"","notes":"","remarks":""},
  {"date":"2026-07-27","oldReg":"BCL-399","newReg":"AAGY-330","type":"Private","owner":"","party":"SH","receiptDate":"2026-08-01","receipt":52964,"insurance":0,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":3200,"status":"","notes":"","remarks":""},
  {"date":"2026-07-27","oldReg":"BEX-769","newReg":"AAGY-349","type":"Private","owner":"","party":"SH","receiptDate":"2026-08-01","receipt":15350,"insurance":0,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":3200,"status":"","notes":"","remarks":""},
  {"date":"2026-07-28","oldReg":"CS-8088","newReg":"","type":"Private","owner":"","party":"SH","receiptDate":"","receipt":0,"insurance":0,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":0,"status":"","notes":"","remarks":""},
  {"date":"2026-07-30","oldReg":"AYL-292","newReg":"","type":"Private","owner":"","party":"SH","receiptDate":"","receipt":0,"insurance":0,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":0,"status":"","notes":"","remarks":""},
  {"date":"2026-07-28","oldReg":"ADF-523","newReg":"AAHC-832","type":"Private","owner":"","party":"SH","receiptDate":"","receipt":0,"insurance":0,"fitness":0,"permit":0,"mvi":0,"alt":0,"other":0,"status":"","notes":"","remarks":""}
];
