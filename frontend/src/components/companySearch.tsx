"use client";

import { fetchCompanyStatus } from "@/api/companyAPI";
import { CompanyData, FinancialData } from "@/types/company";
import { useState } from "react";

// 금액 포맷: 원 → 억원 단위
function formatRevenue(value: number): string {
   const billions = value / 100000000;
   if (billions >= 10000) {
      return (billions / 10000).toFixed(1) + "조";
   }
   return Math.round(billions).toLocaleString() + "억";
}

// 인원수 포맷
function formatEmployees(value: number): string {
   if (value >= 10000) {
      return (value / 10000).toFixed(1) + "만명";
   }
   return value.toLocaleString() + "명";
}

export default function CompanySearch() {
   const [regNum, setRegNum] = useState<string>("");
   const [result, setResult] = useState<CompanyData | null>(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleSearch = async () => {
      const cleaned = regNum.replace(/[^0-9]/g, "");
      if (!cleaned) {
         setError("사업자번호를 입력해주세요.");
         return;
      }
      setLoading(true);
      setError(null);
      setResult(null);
      try {
         const data = await fetchCompanyStatus(cleaned);
         setResult(data);
      } catch (err) {
         console.error("API 요청 에러:", err);
         setError("조회 중 문제가 발생했습니다. 서버가 켜져있는지 확인해주세요!");
      } finally {
         setLoading(false);
      }
   };

   // 매출 그래프 높이 계산 (최대값 대비 비율)
   const getBarHeight = (values: number[], idx: number): number => {
      const max = Math.max(...values);
      if (max === 0) return 0;
      return (values[idx] / max) * 100;
   };

   const history = result?.history || [];
   const revenues = history.map((h) => h.revenue || 0);
   const employees = history.map((h) => h.employeeCount || 0);

   return (
      <div className="flex flex-col items-center">
         {/* Hero Section */}
         <section className="w-full bg-white pt-20 pb-16 px-6 text-center border-b border-gray-50">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
               세상의 모든 기업 정보,<br />
               <span className="text-moneypin">Bizno</span>에서 한눈에
            </h1>
            <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto">
               사업자번호를 입력하면 실시간 영업상태, 재무제표, 직원현황까지 확인됩니다.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
               <div className="absolute inset-0 bg-moneypin/10 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
               <div className="relative flex items-center bg-white rounded-2xl p-2 search-shadow border border-gray-100 focus-within:border-moneypin/30 transition-all">
                  <div className="pl-4 text-gray-400">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                  <input
                     type="text"
                     value={regNum}
                     onChange={(e) => setRegNum(e.target.value)}
                     onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                     placeholder="사업자번호 10자리 입력 (예: 124-81-00998)"
                     className="flex-1 px-4 py-3 text-lg outline-none text-gray-800 placeholder:text-gray-300 bg-transparent"
                  />
                  <button
                     onClick={handleSearch}
                     disabled={loading}
                     className="bg-moneypin text-white px-8 py-3 rounded-xl font-bold hover:bg-moneypin-hover transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                     {loading ? (
                        <span className="flex items-center gap-2">
                           <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                           조회중...
                        </span>
                     ) : "조회하기"}
                  </button>
               </div>
            </div>

            {/* 빠른 테스트 사업자번호 */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
               {[
                  { label: "삼성전자", num: "1248100998" },
                  { label: "SK하이닉스", num: "2208115988" },
                  { label: "LG전자", num: "1138110545" },
                  { label: "현대자동차", num: "1101110813" },
                  { label: "네이버", num: "2148611485" },
               ].map((item) => (
                  <button
                     key={item.num}
                     onClick={() => { setRegNum(item.num); }}
                     className="px-4 py-1.5 bg-gray-50 text-gray-500 text-sm font-medium rounded-full border border-gray-100 cursor-pointer hover:bg-white hover:border-moneypin/20 hover:text-moneypin transition-all"
                  >
                     {item.label}
                  </button>
               ))}
            </div>

            {error && (
               <div className="mt-6 text-red-500 text-sm font-medium bg-red-50 inline-block px-6 py-2 rounded-lg">
                  ⚠️ {error}
               </div>
            )}
         </section>

         {/* Result Section */}
         <section className="w-full max-w-4xl px-6 py-12">
            {loading && (
               <div className="text-center py-20">
                  <div className="inline-block p-6 bg-white rounded-full card-shadow mb-4">
                     <svg className="animate-spin h-10 w-10 text-moneypin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                     </svg>
                  </div>
                  <p className="text-gray-500 font-medium">DART API에서 5개년 데이터를 수집하는 중...</p>
                  <p className="text-gray-400 text-sm mt-1">최초 조회 시 10~20초 정도 소요될 수 있습니다.</p>
               </div>
            )}

            {!loading && result && (
               <div>
                  {/* Summary Card */}
                  <div className="bg-white rounded-3xl p-8 card-shadow border border-gray-50 mb-8">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                           <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold text-white ${
                                 result.status === "01" ? "bg-green-500" : result.status === "02" ? "bg-amber-500" : "bg-red-500"
                              }`}>
                                 {result.status === "01" ? "● 정상영업" : result.status === "02" ? "● 휴업" : "● 폐업"}
                              </span>
                              {result.corpType && (
                                 <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">
                                    {result.corpType}
                                 </span>
                              )}
                           </div>
                           <h2 className="text-3xl font-bold text-gray-900">{result.company}</h2>
                           <p className="text-gray-400 text-sm mt-1">사업자번호: {result.regNum} · {result.tax_type}</p>
                        </div>
                     </div>

                     {/* 상세 정보 그리드 */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-gray-50">
                        <InfoItem label="설립일" value={result.foundationDate} />
                        <InfoItem label="대표자" value={result.ceo} />
                        <InfoItem label="업종코드" value={result.type} />
                        <InfoItem label="영업상태" value={
                           result.status === "01" ? "계속사업자" : result.status === "02" ? "휴업자" : "폐업자"
                        } highlight={result.status === "01" ? "green" : "red"} />
                        <InfoItem label="대표전화" value={result.phoneNum} />
                        <InfoItem label="대표팩스" value={result.faxNum} />
                        <InfoItem label="홈페이지" value={result.email} />
                        <InfoItem label="주소" value={result.addr} wide />
                     </div>
                  </div>

                  {/* 5개년 차트 섹션 */}
                  {history.length > 0 && (
                     <>
                        <div className="flex gap-8 border-b border-gray-200 mb-8 px-2">
                           <button className="pb-4 border-b-2 border-moneypin text-moneypin font-bold text-sm">
                              재무/고용 현황 (실제 DART 데이터)
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {/* 매출액 차트 */}
                           {revenues.some(v => v > 0) && (
                              <div className="bg-white rounded-3xl p-6 border border-gray-50 card-shadow">
                                 <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-moneypin rounded-full" />
                                    매출액 추이 (IFRS 연결)
                                 </h4>
                                 <div className="h-52 flex items-end justify-around px-2 pb-2">
                                    {history.map((h, i) => (
                                       <div key={i} className="flex flex-col items-center gap-1 flex-1 mx-1">
                                          <span className="text-[9px] text-gray-500 font-bold mb-1">
                                             {formatRevenue(h.revenue || 0)}
                                          </span>
                                          <div className="w-full max-w-10 bg-gray-50 rounded-t-lg relative" style={{ height: "160px" }}>
                                             <div
                                                className="absolute bottom-0 w-full bg-moneypin/60 hover:bg-moneypin rounded-t-lg transition-all cursor-pointer"
                                                style={{ height: `${getBarHeight(revenues, i)}%` }}
                                             />
                                          </div>
                                          <span className="text-[10px] text-gray-400 font-medium">{h.year}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {/* 직원수 차트 */}
                           {employees.some(v => v > 0) && (
                              <div className="bg-white rounded-3xl p-6 border border-gray-50 card-shadow">
                                 <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                                    직원수 추이 (사업보고서 기준)
                                 </h4>
                                 <div className="h-52 flex items-end justify-around px-2 pb-2">
                                    {history.map((h, i) => (
                                       <div key={i} className="flex flex-col items-center gap-1 flex-1 mx-1">
                                          <span className="text-[9px] text-gray-500 font-bold mb-1">
                                             {formatEmployees(h.employeeCount || 0)}
                                          </span>
                                          <div className="w-full max-w-10 bg-gray-50 rounded-t-lg relative" style={{ height: "160px" }}>
                                             <div
                                                className="absolute bottom-0 w-full bg-blue-400 hover:bg-blue-600 rounded-t-lg transition-all cursor-pointer"
                                                style={{ height: `${getBarHeight(employees, i)}%` }}
                                             />
                                          </div>
                                          <span className="text-[10px] text-gray-400 font-medium">{h.year}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* 매출/직원수 숫자 테이블 */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-50 card-shadow mt-6">
                           <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <span className="w-1.5 h-4 bg-gray-400 rounded-full" />
                              연도별 상세 수치
                           </h4>
                           <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                 <thead>
                                    <tr className="border-b border-gray-100">
                                       <th className="py-3 text-left text-gray-400 font-medium">연도</th>
                                       <th className="py-3 text-right text-gray-400 font-medium">매출액</th>
                                       <th className="py-3 text-right text-gray-400 font-medium">직원수</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {history.map((h, i) => (
                                       <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                          <td className="py-3 font-bold text-gray-700">{h.year}년</td>
                                          <td className="py-3 text-right text-gray-600">
                                             {h.revenue ? formatRevenue(h.revenue) : "-"}
                                          </td>
                                          <td className="py-3 text-right text-gray-600">
                                             {h.employeeCount ? formatEmployees(h.employeeCount) : "-"}
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     </>
                  )}
               </div>
            )}

            {/* 초기 상태 (결과 없음) */}
            {!loading && !result && !error && (
               <div className="text-center py-20 opacity-30 select-none">
                  <div className="mb-6 inline-block p-8 bg-gray-100 rounded-full">
                     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                  <p className="text-xl font-medium text-gray-400">사업자번호를 입력하고 조회하기를 눌러주세요</p>
                  <p className="text-gray-300 text-sm mt-2">삼성전자, SK하이닉스 등 빠른 테스트 버튼도 이용해보세요</p>
               </div>
            )}
         </section>
      </div>
   );
}

// 정보 항목 컴포넌트
function InfoItem({ label, value, highlight, wide }: {
   label: string;
   value?: string;
   highlight?: "green" | "red";
   wide?: boolean;
}) {
   if (!value || value === "-") return null;
   const colorClass = highlight === "green" ? "text-green-600" :
                      highlight === "red" ? "text-red-600" : "text-gray-800";
   return (
      <div className={wide ? "col-span-2" : ""}>
         <p className="text-gray-400 text-xs mb-1">{label}</p>
         <p className={`font-bold text-sm ${colorClass} break-words`}>{value}</p>
      </div>
   );
}