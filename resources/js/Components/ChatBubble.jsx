export default function ChatBubble({ message, isOwn }) {
    const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`max-w-[75%] ${isOwn ? 'order-2' : ''}`}>
                {!isOwn && (
                    <div className="text-[10px] font-bold text-gray-400 mb-1 ml-1">
                        {message.sender?.name}
                    </div>
                )}
                <div className={`px-4 py-3 rounded-2xl text-sm ${
                    isOwn
                        ? 'bg-[#FF6600] text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-bl-md'
                }`}>
                    {message.body}
                    {message.attachment && (
                        <a
                            href={`/storage/${message.attachment}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block mt-2 text-xs underline ${isOwn ? 'text-white/80' : 'text-[#FF6600]'}`}
                        >
                            View Attachment
                        </a>
                    )}
                </div>
                <div className={`text-[10px] text-gray-400 mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                    {time}
                </div>
            </div>
        </div>
    );
}
