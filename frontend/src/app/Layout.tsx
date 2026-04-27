/*
Layout: 집의 '틀(Frame)'과 같습니다. 

이 레이아웃 컴포넌트는 메인 콘텐츠가 들어갈 자리를 딱 잡고, 
그 주위로 공통으로 필요한 요소들을 둘러싸는 역할을 합니다.

header (머리글): 웹사이트의 상단 부분. 보통 로고, 사이트 이름, 상단 메뉴 등이 위치합니다.
footer (바닥글): 웹사이트의 하단 부분. 저작권 정보, 회사 주소, 연락처 등이 위치합니다.
children: 이 레이아웃 안에서 실제 보여질 핵심 내용입니다. (예: 방금 만든 CompanySearch 컴포넌트)
*/

export default function RootLayout({
   children, //여기가 핵심입니다. page.tsx의 내용이 이 'children' 자리로 전달됩니다.
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="ko">
         <body>
            <header style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
               <h1>우리 회사 사이트</h1>
            </header>
            <main style={{ padding: '20px' }}>
               {/* 우리가 만든 page.tsx가 이 children 자리에 쏙 들어가서 그려집니다! */}
               {children}
            </main>
            <footer style={{ padding: '20px', backgroundColor: '#f0f0f0', textAlign: 'center' }}>
               <p>회사 정보는 여기에</p>
            </footer>
         </body>
      </html>
   );
}