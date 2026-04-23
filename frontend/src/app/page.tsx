"use client"; // 리액트에서 클라이언트 컴포넌트를 사용하겠다는 선언

import { fetchCompanyStatus } from "@/types/company";
import { useState } from "react";

export default function Home() {
  const [regNum, setRegNum] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNum) return;

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      // 프론트엔드에서 백엔드로 사업자 정보를 달라고 요청하는 부분입니다!
      const result = await fetchCompanyStatus(regNum);
      setStatus(result);
    } catch (err) {
      setError("조회에 실패했습니다. 백엔드 서버가 켜져 있는지 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-blue-200">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all">
        {/* 헤더 섹션 */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            사업자 상태 조회
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            국세청 API를 활용한 실시간 사업자 휴폐업 조회
          </p>
        </div>

        {/* 검색 폼 섹션 */}
        <form className="mt-8 space-y-6" onSubmit={handleSearch}>
          <div className="space-y-1">
            <label
              htmlFor="regNum"
              className="block text-sm font-semibold text-slate-700"
            >
              사업자등록번호
            </label>
            <input
              id="regNum"
              name="regNum"
              type="text"
              required
              className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-900"
              placeholder="숫자만 입력해주세요 (예: 1234567890)"
              value={regNum}
              onChange={(e) => setRegNum(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>

          <button
            type="submit"
            disabled={loading || regNum.length === 0}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                조회 중...
              </span>
            ) : (
              "조회하기"
            )}
          </button>
        </form>

        {/* 결과 표시 섹션 */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {status && (
          <div className="mt-6 p-6 rounded-2xl bg-slate-50 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center text-center">
              <div className={`text-sm font-bold tracking-widest uppercase mb-1 ${status.includes('계속') ? 'text-green-600' : 'text-slate-500'}`}>
                조회 결과
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {status}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
