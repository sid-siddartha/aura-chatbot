"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [iframeUrl, setIframeUrl] = useState("");

  useEffect(() => {
    // 第一步：获取初始 URL
    fetch("/api/ayd_widget", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then(({ url }) => {
        setIframeUrl(url);
      });
  }, []);


  return (
    <main className="h-[calc(100vh-96px)]">
      <iframe
        className="mx-auto w-full h-full"
        src={iframeUrl}
      ></iframe>
    </main>
  );
}