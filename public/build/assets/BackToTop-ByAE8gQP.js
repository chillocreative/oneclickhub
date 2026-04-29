import{c as i,r as o,j as r}from"./app-BS2VFPTj.js";const c=[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]],l=i("arrow-up",c);function p({threshold:e=320}){const[s,n]=o.useState(!1);o.useEffect(()=>{const t=()=>n(window.scrollY>e);return t(),window.addEventListener("scroll",t,{passive:!0}),()=>window.removeEventListener("scroll",t)},[e]);const a=()=>{window.scrollTo({top:0,behavior:"smooth"})};return r.jsx("button",{type:"button",onClick:a,"aria-label":"Back to top",className:`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full
                bg-gradient-to-br from-[#FF6600] to-[#FFB800] text-white
                shadow-lg shadow-orange-500/40
                flex items-center justify-center
                hover:scale-105 active:scale-95
                transition-all duration-200 ${s?"opacity-100 translate-y-0 pointer-events-auto":"opacity-0 translate-y-4 pointer-events-none"}`,children:r.jsx(l,{size:22,strokeWidth:2.5})})}export{p as B};
