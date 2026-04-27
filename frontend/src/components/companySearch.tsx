//useClient를 사용해야지 상태를 저장하고 변경하는훅을 사용할수있음 (
//server side code가 아니라 client side code라는걸 명시하는것이 좋음)
"use client";
/*
React의 useState와 useEffect 핵심 차이: "데이터의 유통기한" ⏰

💡 useState (현재 시점의 기억 저장소)
컴포넌트가 화면에 그려질 때(Mounting) 딱 한 번 초기값(Initial Value)을 부여받고, 
그 이후로는 오직 개발자가 명시적으로 "이걸로 바꿔줘" (setCount(10))라고 명령할 때만 자신의 값을 업데이트합니다.

유통기한: 내가 손으로 직접 바꿀 때까지 → 무제한 (영구 저장소)

💡 useEffect (시간이 지나야 변하는 값 처리)
컴포넌트가 처음 화면에 나타났을 때(1회), 또는 특정 변수가 바뀔 때(Dependency 변화) "그때 돼서 실행되는 코드 묶음"입니다.

유통기한: 특정 조건이 만족될 때까지 → 조건부 (일시적 저장소)

*/
import { fetchCompanyStatus } from "@/api/companyAPI";
import { CompanyData } from "@/types/company";
import { useState } from "react"; //hook:리액트에서 제공하는 함수로 상태관리,이벤트처리등을 가능하게함

export default function CompanySearch() {

   // 💡 useState 핵심 1: 사용자가 입력창에 적은 '사업자번호'를 임시로 기억하는 공간

   const [regNum, setRegNum] = useState<string>("");

   // 💡 useState 핵심 2: 백엔드에서 도착한 '조회 결과(DTO 상자)'를 기억하는 공간
   const [result, setResult] = useState<CompanyData | null>(null); // CompanyData의 껍데기이거나 또는 null이 들어갈 수 있음

   // 버튼을 눌렀을 때 실행될 함수
   const handleSearch = async () => { //
      // 백엔드로 통신을 보내서 데이터를 받아옴
      const data = await fetchCompanyStatus(regNum);
      // 받아온 데이터를 result 공간에 집어넣음 -> ★이 순간 화면이 자동으로 새로고침(리렌더링)됨!★
      setResult(data);//state 업데이트로인해 화면이 새로고침됨
   };


   return (
      <div style={{ padding: '20px' }}>
         <h2>사업자상태조회</h2>
         {/* 입력창에 글자를 칠때마다 regNum상태가 없데이트됨*/}
         <input type="text" value={regNum} onChange={(e) => setRegNum(e.target.value)}
            placeholder="사업자번호를 입력하세요(기호없이)" />

         {/*onClick EVENT*/}
         <button onClick={handleSearch}>조회하기</button>

         {/*result데이터가 들어오면 보여준다*/}
         {result && (
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid black' }}>
               <h3>사업자 상태 조회 결과</h3>
               <p>회사명:{result?.company}</p>
               <p>사업자번호:{result?.regNum}</p>
               <p>업종:{result.type}</p>
               <p>영업상태:{result.status === "01" ? "🟢 계속사업자" : "🔴 폐업자"}</p>
               <p>과세유형:{result.tax_type}</p>

            </div>
         )
         }



      </div >
   )
}