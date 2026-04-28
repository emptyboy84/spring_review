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
                     <div className="w-8 h-8 bg-moneypin rounded-lg flex items-center justify-center text-white font-black italic">H</div>
                     <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">Harness <span className="text-moneypin">Engineering</span></span>
                  </div>
                  <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500">
                     <a href="#" className="text-moneypin">기업분석</a>
                     <a href="#" className="hover:text-moneypin transition-colors">데이터랩</a>
                     <a href="#" className="hover:text-moneypin transition-colors">API센터</a>
                  </nav>
               </div>
            </header>

            <main className="min-h-screen">
               {children}
            </main>

            {/* Clean Footer */}
            <footer className="bg-slate-900 text-slate-400 py-20 px-6 border-t border-slate-800">
               <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-1 md:col-span-2">
                     <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic">H</div>
                        <span className="text-xl font-black text-white tracking-tighter uppercase">Harness <span className="text-blue-500">Eng.</span></span>
                     </div>
                     <p className="mt-4 text-sm text-gray-400 max-w-sm font-medium leading-relaxed">
                        하네스 엔지니어링은 DART와 웹 데이터 인텔리전스를 결합하여 기업의 진정한 가치를 분석하는 차세대 기업 데이터 분석 솔루션입니다.
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
                  © 2026 Harness Engineering. All rights reserved.
               </div>
            </footer>
         </body>
      </html>
   );
}