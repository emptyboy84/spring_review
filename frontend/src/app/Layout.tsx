import "./globals.css";

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="ko">
         <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet" />
         </head>
         <body className="antialiased">
            {/* Premium Sticky Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
               <div className="max-w-7xl mx-auto flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <span className="text-2xl font-bold text-moneypin tracking-tighter">Bizno</span>
                     <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded">CLONE</span>
                  </div>
                  <nav className="hidden md:flex gap-8 text-sm font-semibold text-gray-600">
                     <a href="#" className="hover:text-moneypin transition-colors">사업자조회</a>
                     <a href="#" className="hover:text-moneypin transition-colors">기업분석</a>
                     <a href="#" className="hover:text-moneypin transition-colors">AI 브리핑</a>
                  </nav>
                  <button className="bg-moneypin text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-moneypin-hover transition-all">
                     무료 시작하기
                  </button>
               </div>
            </header>

            <main className="min-h-screen">
               {children}
            </main>

            {/* Clean Footer */}
            <footer className="bg-white border-t border-gray-100 py-12 px-6">
               <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-1 md:col-span-2">
                     <span className="text-xl font-bold text-gray-400">Bizno Clone</span>
                     <p className="mt-4 text-sm text-gray-500 max-w-sm">
                        대한민국 모든 기업의 정보를 한눈에 확인하세요.<br />
                        국세청 및 DART API를 연동한 실시간 기업 데이터 서비스입니다.
                     </p>
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-900 mb-4">서비스</h4>
                     <ul className="text-sm text-gray-500 space-y-2">
                        <li>사업자 상태조회</li>
                        <li>재무제표 분석</li>
                        <li>고용 현황</li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-900 mb-4">고객지원</h4>
                     <ul className="text-sm text-gray-500 space-y-2">
                        <li>이용안내</li>
                        <li>문의하기</li>
                        <li>개인정보처리방침</li>
                     </ul>
                  </div>
               </div>
               <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-50 text-center text-xs text-gray-400">
                  © 2026 Bizno Clone Project. All rights reserved.
               </div>
            </footer>
         </body>
      </html>
   );
}