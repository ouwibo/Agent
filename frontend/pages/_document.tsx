import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%230ea5e9' width='100' height='100' rx='20'/></svg>" />
      </Head>
      <body className="bg-dark-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
