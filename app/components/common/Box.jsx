// "use client";
// import { useState } from "react";

// export default function Chat() {
//   const [message, setMessage] = useState(""); // input value
//   const [messages, setMessages] = useState([]); // chat messages

//   const sendMessage = () => {
//     if (message.trim() === "") return;

//     setMessages((prev) => [
//       ...prev,
//       { text: message, sender: "me" },
//     ]);
//     setMessage("");
//   };

//   return (
//     <div className="h-screen flex flex-col border">
      
//       {/* CHAT BOX */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-2">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`max-w-[70%] p-2 rounded-lg text-sm
//               ${msg.sender === "me"
//                 ? "bg-purple-500 text-white ml-auto"
//                 : "bg-gray-200 text-black mr-auto"}`}
//           >
//             {msg.text}
//           </div>
//         ))}
//       </div>

//       {/* INPUT AREA */}
//       <div className="p-3 border-t flex gap-2">
//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Type a message..."
//           className="flex-1 border rounded px-3 py-2 outline-none"
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-purple-500 text-white px-4 rounded"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }
