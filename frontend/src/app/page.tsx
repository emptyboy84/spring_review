// 1. 우리가 만든 조회창 컴포넌트를 불러옵니다. (경로는 실제 파일 위치에 맞게 조절)
import CompanySearch from "../components/companySearch"; //함수임포트할댄 {}안써요




export default function Home() { //메인도화지를 정의하는 함수 

   return (
      <main style={{ minHeight: '100vh', padding: '50px' }}>
         <h1>환영합니다! 🥳</h1>
         <p>최종적으로 띄워주는 메인 도화지</p>

         {/* 2. 도화지 한가운데에 조회창 컴포넌트를 똭! 배치합니다 */}

         <CompanySearch />
      </main>
   )

}