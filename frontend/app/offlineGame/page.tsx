"use client"

import DrawAreaOffline from "@/components/DrawAreaOffline";

export default function OfflineGamePage() {
  return (
    <div className="flex items-center justify-center w-full h-screen px-4">
      <div className="w-full max-w-[1000px] h-auto aspect-[4/3]">
        <DrawAreaOffline />
      </div>
    </div>
  );
}
