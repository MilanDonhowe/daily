import React from 'react'

interface LayoutProps {
    title: string
    children: React.ReactNode
}

function Layout(props: LayoutProps) {
  return (
    <html>
      <head>
        <title>{props.title}</title>
        <link rel="stylesheet" href="/stylesheets/style.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
          // This is making use of ES6 template strings, which allow for
          // multiline strings. We specified "{jsx: {harmony: true}}" when
          // creating the engine in app.js to get this feature.
          console.log("hello world");
        `,
          }}
        />
      </head>
      <body>{props.children}</body>
    </html>
  );
}


export default Layout