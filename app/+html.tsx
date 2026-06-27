import { type PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>ChopWise</title>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#007A3D" />
        <meta name="application-name" content="ChopWise" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ChopWise" />
        <meta
          name="description"
          content="Track Ghanaian meals, calories, and macros from your phone."
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root { min-height: 100%; }
              body {
                margin: 0;
                overflow: hidden;
                background: #e9eeeb;
                overscroll-behavior-y: none;
                -webkit-font-smoothing: antialiased;
              }
              * { box-sizing: border-box; }
              button, input, textarea { font: inherit; }
              @media (display-mode: standalone) {
                body { background: #f5f6f8; }
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
