"use client";

import { fetchUnifiedSearch, fetchDetailByCorpCode } from "@/api/companyAPI";
import { useState } from "react";

// 금액 포맷: 원 → 억/조 단위
function formatRevenue(value: number): string {
   const billions = value / 100000000;
   if (billions >= 10000) return (billions / 10000).toFixed(1) + "조";
   if (billions >= 1) return Math.round(billions).toLocaleString() + "억";
   return Math.round(value / 10000).toLocaleString() + "만";
}

// 인원수 포맷
function formatEmployees(value: number): string {
   if (value >= 10000) return (value / 10000).toFixed(1) + "만명";
   return value.toLocaleString() + "명";
}

export default function CompanySearch() {
   const [keyword, setKeyword] = useState("");
   const [result, setResult] = useState<any>(null);
   const [searchList, setSearchList] = useState<any[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   // 통합 검색
   const handleSearch = async (targetKeyword?: string) => {
      const query = targetKeyword || keyword;
      if (!query.trim()) {
         setError("회사명, 사업자번호 또는 전화번호를 입력해주세요.");
         return;
      }
      setLoading(true);
      setError(null);
      setResult(null);
      setSearchList([]);
      
      try {
         const data = await fetchUnifiedSearch(query);
         
         if (data.type === "list" && data.searchResults?.length > 0) {
            setSearchList(data.searchResults);
         } else if (data.type === "error") {
            setError(data.message || "검색 결과가 없습니다.");
         } else if (data.company) {
            setResult(data);
         } else {
            setError("검색 결과가 없습니다.");
         }
      } catch (err) {
         console.error("API 요청 에러:", err);
         setError("서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.");
      } finally {
         setLoading(false);
      }
   };

   // 검색 리스트에서 기업 선택 → corp_code로 상세 조회
   const handleSelectCompany = async (corpCode: string) => {
      setLoading(true);
      setError(null);
      setSearchList([]);
      setResult(null);
      
      try {
         const data = await fetchDetailByCorpCode(corpCode);
         if (data.company) {
            setResult(data);
         } else {
            setError("기업 상세 정보를 불러올 수 없습니다.");
         }
      } catch (err) {
         console.error("상세 조회 에러:", err);
         setError("상세 조회 중 오류가 발생했습니다.");
      } finally {
         setLoading(false);
      }
   };

   // 바 차트 높이 계산
   const getBarHeight = (values: number[], idx: number): number => {
      const max = Math.max(...values);
      if (max === 0) return 0;
      return (values[idx] / max) * 100;
   };

   const history = result?.history || [];
   const revenues = history.map((h: any) => h.revenue || 0);
   const employees = history.map((h: any) => h.employeeCount || 0);

   return (
      <div className="flex flex-col items-center">
         {/* Hero Section */}
         <section className="w-full bg-white pt-24 pb-20 px-6 text-center border-b border-gray-50">
            <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-6 tracking-wider">
               HARNESS ENGINEERING — CORPORATE INTELLIGENCE
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
               기업 통합 분석 시스템
            </h1>
            <p className="text-gray-500 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
               DART·국세청·맵 데이터를 통합하여 기업의 5개년 재무·고용 트렌드와<br />
               실시간 영업 상태, 대표 연락처를 한 번에 분석합니다.
            </p>

            {/* Unified Search Bar */}
            <div className="max-w-3xl mx-auto relative group">
               <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
               <div className="relative flex items-center bg-white rounded-2xl p-2 search-shadow border border-gray-100 focus-within:border-blue-500/40 transition-all">
                  <div className="pl-5 text-gray-400">
                     <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                  <input
                     type="text"
                     value={keyword}
                     onChange={(e) => setKeyword(e.target.value)}
                     onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                     placeholder="회사명, 사업자번호(10자리) 또는 대표번호 입력"
                     className="flex-1 px-5 py-4 text-xl outline-none text-gray-800 placeholder:text-gray-300 bg-transparent font-medium"
                  />
                  <button
                     onClick={() => handleSearch()}
                     disabled={loading}
                     className="bg-moneypin text-white px-10 py-4 rounded-xl font-bold hover:bg-moneypin-hover transition-all disabled:opacity-50"
                  >
                     {loading ? "분석중..." : "Search"}
                  </button>
               </div>
            </div>

            {/* Quick Test Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-10">
               {[
                  { label: "삼성전자", value: "1248100998" },
                  { label: "SK하이닉스", value: "2208115988" },
                  { label: "LG전자", value: "1138110545" },
                  { label: "현대자동차", value: "1101110813" },
                  { label: "네이버", value: "네이버" },
               ].map((item) => (
                  <button
                     key={item.value}
                     onClick={() => { setKeyword(item.value); handleSearch(item.value); }}
                     className="px-5 py-2 bg-gray-50 text-gray-500 text-sm font-semibold rounded-full border border-gray-100 hover:bg-white hover:border-blue-500/30 hover:text-blue-700 transition-all"
                  >
                     {item.label}
                  </button>
               ))}
            </div>

            {error && (
               <div className="mt-8 text-red-600 text-sm font-bold bg-red-50 inline-block px-8 py-3 rounded-xl border border-red-100">
                  {error}
               </div>
            )}
         </section>

         {/* Result Section */}
         <section className="w-full max-w-5xl px-6 py-16">
            {/* Loading */}
            {loading && (
               <div className="text-center py-20">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">DART·국세청 데이터를 수집하고 있습니다...</p>
               </div>
            )}

            {/* Search Results List */}
            {searchList.length > 0 && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                  <div className="col-span-full mb-4">
                     <h3 className="text-xl font-bold text-gray-800">검색 결과 ({searchList.length}건)</h3>
                     <p className="text-gray-400 text-sm">조회할 기업을 선택해주세요.</p>
                  </div>
                  {searchList.map((item: any, idx: number) => (
                     <div 
                        key={idx}
                        onClick={() => handleSelectCompany(item.corpCode)}
                        className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow hover:border-blue-500/40 cursor-pointer transition-all flex justify-between items-center group"
                     >
                        <div>
                           <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">{item.corpName}</h4>
                           <p className="text-gray-400 text-xs mt-1">DART 고유번호: {item.corpCode}</p>
                        </div>
                        <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* Detailed Info View */}
            {result && (
               <div>
                  {/* Summary Card */}
                  <div className="bg-white rounded-3xl p-10 card-shadow border border-gray-50 mb-10 overflow-hidden relative">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/40 rounded-full -mr-32 -mt-32" />
                     
                     <div className="relative flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="flex-1">
                           <div className="flex flex-wrap items-center gap-3 mb-4">
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold text-white uppercase tracking-wider ${
                                 result.status === "01" ? "bg-emerald-500" : result.status === "02" ? "bg-amber-500" : "bg-rose-500"
                              }`}>
                                 {result.status === "01" ? "정상영업" : result.status === "02" ? "휴업" : result.status === "03" ? "폐업" : "확인중"}
                              </span>
                              {result.corpType && (
                                 <span className="px-3 py-1 bg-moneypin text-white text-[10px] font-black rounded-lg">
                                    {result.corpType}
                                 </span>
                              )}
                           </div>
                           <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">{result.company}</h2>
                           <p className="text-slate-400 font-medium flex items-center gap-2 text-sm">
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                              {result.tax_type} · 사업자번호 {result.regNum}
                           </p>
                        </div>
                        
                        {/* Map Links */}
                        <div className="flex gap-3 flex-shrink-0">
                           {result.naverMapLink && (
                              <a href={result.naverMapLink} target="_blank" rel="noopener noreferrer"
                                 className="flex items-center gap-2 px-5 py-3 bg-[#03C75A] text-white rounded-xl font-bold text-sm hover:brightness-90 transition-all">
                                 네이버 지도
                              </a>
                           )}
                           {result.kakaoMapLink && (
                              <a href={result.kakaoMapLink} target="_blank" rel="noopener noreferrer"
                                 className="flex items-center gap-2 px-5 py-3 bg-[#FEE500] text-[#3C1E1E] rounded-xl font-bold text-sm hover:brightness-90 transition-all">
                                 카카오맵
                              </a>
                           )}
                        </div>
                     </div>

                     {/* Info Grid — 명세서 10대 지표 */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8 mt-12 pt-10 border-t border-slate-100">
                        <InfoItem label="설립일" value={result.foundationDate} />
                        <InfoItem label="대표자" value={result.ceo} />
                        <InfoItem label="업종" value={result.type} />
                        <InfoItem label="종목코드" value={result.stockCode} />
                        <InfoItem label="대표전화" value={result.phoneNum} />
                        <InfoItem label="대표팩스" value={result.faxNum} />
                        <InfoItem label="대표메일" value={result.representativeEmail} highlight />
                        <InfoItem label="홈페이지" value={result.email} link />
                        <InfoItem label="주소" value={result.addr} wide />
                     </div>
                  </div>

                  {/* Charts */}
                  {history.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Revenue Chart */}
                        <div className="bg-slate-900 rounded-3xl p-8 card-shadow border border-slate-800 text-white">
                           <h4 className="font-bold text-slate-300 mb-8 flex items-center gap-3 text-sm">
                              <span className="w-2 h-5 bg-blue-500 rounded-full" />
                              매출 추이 (IFRS 연결, 5개년)
                           </h4>
                           <div className="h-56 flex items-end justify-around px-2 pb-2">
                              {history.map((h: any, i: number) => (
                                 <div key={i} className="flex flex-col items-center gap-3 flex-1 mx-1 group">
                                    <span className="text-[10px] text-blue-400 font-black opacity-0 group-hover:opacity-100 transition-opacity">
                                       {formatRevenue(h.revenue || 0)}
                                    </span>
                                    <div className="w-full max-w-10 bg-slate-800 rounded-xl relative overflow-hidden" style={{ height: "160px" }}>
                                       <div
                                          className="absolute bottom-0 w-full bg-gradient-to-t from-blue-700 to-blue-400 rounded-xl transition-all duration-700 ease-out"
                                          style={{ height: `${getBarHeight(revenues, i)}%` }}
                                       />
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-bold">{h.year}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Employee Chart */}
                        <div className="bg-white rounded-3xl p-8 card-shadow border border-slate-100">
                           <h4 className="font-bold text-slate-700 mb-8 flex items-center gap-3 text-sm">
                              <span className="w-2 h-5 bg-slate-900 rounded-full" />
                              직원 현황 (5개년)
                           </h4>
                           <div className="h-56 flex items-end justify-around px-2 pb-2">
                              {history.map((h: any, i: number) => (
                                 <div key={i} className="flex flex-col items-center gap-3 flex-1 mx-1 group">
                                    <span className="text-[10px] text-slate-400 font-black opacity-0 group-hover:opacity-100 transition-opacity">
                                       {formatEmployees(h.employeeCount || 0)}
                                    </span>
                                    <div className="w-full max-w-10 bg-slate-50 rounded-xl relative overflow-hidden" style={{ height: "160px" }}>
                                       <div
                                          className="absolute bottom-0 w-full bg-slate-900 rounded-xl transition-all duration-700 ease-out"
                                          style={{ height: `${getBarHeight(employees, i)}%` }}
                                       />
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-bold">{h.year}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}

                  {/* 뒤로가기 */}
                  <div className="text-center mt-12">
                     <button
                        onClick={() => { setResult(null); setSearchList([]); setError(null); }}
                        className="text-gray-400 hover:text-blue-700 text-sm font-bold transition-colors"
                     >
                        ← 새로운 검색
                     </button>
                  </div>
               </div>
            )}
         </section>
      </div>
   );
}

function InfoItem({ label, value, highlight, link, wide }: {
   label: string;
   value?: string;
   highlight?: boolean;
   link?: boolean;
   wide?: boolean;
}) {
   if (!value || value === "-" || value.trim() === "") return null;
   return (
      <div className={wide ? "col-span-full md:col-span-2" : ""}>
         <p className="text-slate-400 text-[11px] font-bold mb-1.5 uppercase tracking-wider">{label}</p>
         {link ? (
            <a href={value.startsWith("http") ? value : `http://${value}`} target="_blank" rel="noopener noreferrer"
               className="font-bold text-sm text-blue-600 hover:underline break-all">{value}</a>
         ) : (
            <p className={`font-bold text-sm break-words leading-tight ${highlight ? "text-blue-600" : "text-slate-800"}`}>{value}</p>
         )}
      </div>
   );
}