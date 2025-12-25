export default function Footer() {
  return (
    <footer className="bg-primary text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">문화예술 AI 플랫폼</h3>
            <p className="text-sm text-gray-300">
              AI 도슨트와 함께하는 새로운 문화예술 경험
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">바로가기</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="/" className="hover:text-accent">
                  홈
                </a>
              </li>
              <li>
                <a href="/magazine" className="hover:text-accent">
                  매거진
                </a>
              </li>
              <li>
                <a href="/chat" className="hover:text-accent">
                  AI 도슨트
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">문의</h4>
            <p className="text-sm text-gray-300">contact@culture-ai.com</p>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Culture AI Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
