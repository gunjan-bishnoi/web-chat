import { Clipboard, Gallery, Menu, Message, Paste, Share } from "./Icons";

export const NavLinks = [
    {
        name: "Messages",
        link: <Message />
    },
    {
        name: "Status",
        link: <div className="w-6 h-6 border-2 border-current rounded-full border-t-transparent animate-spin-slow" />
    },
    {
        name: "Calls",
        link: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
    },
    {
        name: "Directory",
        link: <Menu />
    }
];


export const Msg = [
    {
        img: "https://xsgames.co/randomusers/assets/avatars/male/1.jpg",
        name: "Elmer Laverty",
        content: "Haha oh man 🔥. Did you see the latest update?",
        time: "12:45 PM",
        tags: ["Question", "Help wanted"]
    },
    {
        img: "https://xsgames.co/randomusers/assets/avatars/female/2.jpg",
        name: "Florencio Dorrance",
        content: "woohoooo! The UI looks amazing now.",
        time: "11:30 AM",
        tags: ["Some content"]
    },
    {
        img: "https://xsgames.co/randomusers/assets/avatars/male/3.jpg",
        name: "Lavern Laboy",
        content: "Haha that's terrifying 😂. Let's fix it soon.",
        time: "Yesterday",
        tags: ["Bug", "Hacktoberfest"]
    },
    {
        img: "https://xsgames.co/randomusers/assets/avatars/female/4.jpg",
        name: "Titus Kitamura",
        content: "omg, this is amazing! Shipping it today?",
        time: "Yesterday",
        tags: ["Question", "Some content"]
    },
    {
        img: "https://xsgames.co/randomusers/assets/avatars/male/5.jpg",
        name: "Geoffrey Mott",
        content: "aww 😍. Thanks for the help!",
        time: "Tuesday",
        tags: ["Request"]
    },
    {
        img: "https://xsgames.co/randomusers/assets/avatars/male/6.jpg",
        name: "Alfonzo Schuessler",
        content: "perfect! Let's sync tomorrow.",
        time: "Monday",
        tags: ["Follow up"]
    },
];

export const ChatFilters = ["All Messages", "Unread", "Archived"];
export const TeamMember = [
    {
        img: "/images/TeamMember1.png",
        name: "Florencio Dorrance",
        job: "Market Development Manager"


    },
    {
        img: "/images/TeamMember2.png",
        name: "Benny Spanbauer",
        job: "Area Sales Manager"

    },
    {
        img: "/images/TeamMember3.png",
        name: "Jamel Eusebio",
        job: "Administrator"

    },
    {
        img: "/images/TeamMember4.png",
        name: "Lavern Laboy",
        job: "Account Executive"

    },
    {
        img: "/images/TeamMember5.png",
        name: "Alfonzo Schuessler",
        job: "Proposal Writer"

    },
    {
        img: "/images/TeamMember6.png",
        name: "Daryl Nehls",
        job: "Nursing Assistant"

    }

];
export const Files = [
    {
        img: <Paste />,
        heading:"i9.pdf",
        type:"PDF",
        size:"9mb"

    },
     {
        img: <Gallery />,
        heading:"Screenshot-3817.png",
        type:"PNG",
        size:"4mb"

    }, {
        img: <Share />,
        heading:"sharefile.docx",
        type:"DOC",
        size:"555kb"

    }, {
        img: <Clipboard />,
        heading:"Jerry-2020_I-9_Form.xxl",
        type:"XXL",
        size:"24mb"

    },

];
