"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { aiExpertList } from "@/services/Options";
import Image from "next/image";
import { UserButton } from "@stackframe/stack";
import { Button } from "@/components/ui/button";

function DiscussionRoom() {
  const params = useParams();
  const roomid = params.roomid;
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, {
    id: roomid,
  });

  const [expert, setExpert] = useState();
  const [enableMic, setEnableMic] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const recorder = useRef(null);
  const silenceTimeout = useRef(null);

  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = aiExpertList.find(
        (item) => item.name === DiscussionRoomData.expertName
      );
      setExpert(Expert);
    }
  }, [DiscussionRoomData]);

  useEffect(() => {
    return () => {
      if (recorder.current) {
        recorder.current.stopRecording(() => {
          recorder.current.destroy();
          recorder.current = null;
        });
      }
      clearTimeout(silenceTimeout.current);
    };
  }, []);

  const connectToServer = async () => {
    setEnableMic(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const RecordRTCModule = await import("recordrtc");
      const RecordRTC = RecordRTCModule.default;

      recorder.current = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/webm",
        timeSlice: 250,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
        bufferSize: 4096,
        audioBitsPerSecond: 128000,
        ondataavailable: async (blob) => {
          const buffer = await blob.arrayBuffer();

          // ✅ Log to verify recording is working
          console.log("✅ Audio buffer received:", buffer);

          clearTimeout(silenceTimeout.current);
          silenceTimeout.current = setTimeout(() => {
            console.log("⏹️ User stopped talking");
          }, 2000);
        },
      });

      recorder.current.startRecording();
      console.log("🎙️ Recording started");
      setIsRecording(true);
    } catch (err) {
      console.error("❌ Microphone access denied or error:", err);
      setEnableMic(false);
    }
  };

  const disconnect = (e) => {
    e.preventDefault();

    if (recorder.current) {
      recorder.current.stopRecording(() => {
        recorder.current.destroy();
        recorder.current = null;
        console.log("🛑 Recording stopped");
        setIsRecording(false);
        setEnableMic(false);
      });
    }

    clearTimeout(silenceTimeout.current);
  };

  return (
    <div className="mt-0">
      <h2 className="text-lg font-bold">{DiscussionRoomData?.expertName}</h2>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Expert Card */}
        <div className="lg:col-span-1">
          <div className="h-[60vh] bg-gray-400 rounded-4xl flex flex-col items-center justify-center relative">
            {expert?.avatar && (
              <Image
                src={expert.avatar}
                alt="Avatar"
                width={200}
                height={200}
                className="w-20 h-20 rounded-full object-cover animate-pulse"
              />
            )}
            <h2 className="text-gray-700">{expert?.name}</h2>

            <div className="p-2 bg-gray-200 rounded-md absolute bottom-5 right-5">
              <UserButton />
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center">
            {!enableMic ? (
              <Button onClick={connectToServer}>Connect</Button>
            ) : (
              <Button variant="destructive" onClick={disconnect}>
                Disconnect
              </Button>
            )}

            {isRecording && (
              <p className="text-red-600 font-semibold mt-2 animate-pulse">
                🔴 Recording in progress...
              </p>
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div className="lg:col-span-1">
          <div className="h-[60vh] w-[50vh] bg-gray-400 rounded-4xl flex flex-col items-center justify-center relative px-4 py-6">
            <h2>Chat section</h2>
          </div>

          <h2 className="text-black mt-4">
            At the end of your conversation, we will automatically
            <br />
            generate feedback/notes from your conversation.
          </h2>
        </div>
      </div>
    </div>
  );
}

export default DiscussionRoom;
