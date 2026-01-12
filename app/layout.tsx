import "./globals.css";

export const metadata = {
  title: "Clash 订阅生成器",
  description: "合并订阅与手动节点，生成可订阅地址。"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
