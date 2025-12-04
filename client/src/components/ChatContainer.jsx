import React, { useEffect, useRef, useState } from 'react'
import { useChatStore } from "../store/useChatStore"
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'
import MessageSkeleton from './skeletons/MessageSkeleton'
import { useAuthStore } from '../store/authStore'
import { formatMessageTime } from '../lib/utils'

const ChatContainer = () => {
  const { isMessagesLoading, getMessages, selectedUser, messages, subscribeToMessage, unsubscribeFromMessage } = useChatStore()
  const { authUser } = useAuthStore()
  const messageEndRef = useRef(null)

  useEffect(() => {
    getMessages(selectedUser._id)
    subscribeToMessage()

    return () => unsubscribeFromMessage()
  }, [getMessages, selectedUser._id, subscribeToMessage, unsubscribeFromMessage])

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  if (isMessagesLoading) {
    return <div className='flex flex-1 flex-col overflow-auto'>
      <ChatHeader />
      <MessageSkeleton />
      <MessageInput />
    </div>
  }

  return (
    <div className='flex flex-1 flex-col overflow-auto'>
      <ChatHeader />
      <div className='p-4 flex-1 flex-col overflow-y-auto'>
        {messages.map((msg) => (
          <div key={msg._id} className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"} `}>
            <div className='chat-image avatar'>
              <div className='size-10 rounded-full border'>
                <img src={msg.senderId === authUser._id ? authUser.profilePic || "./avatar.png" : selectedUser.profilePic || "./avatar.png"} alt="profile pic" />
              </div>
            </div>
            <div className='chat-header mb-1'>
              <time className="text-xs opacity-50 ml-1">{formatMessageTime(msg.createdAt)}</time>
            </div>
            <div ref={messageEndRef} className='chat-bubble flex flex-col'>
              {msg.image && (
                <img src={msg.image} alt="msg pic" className='sm:max-w-[200px] rounded-md mb-2' />
              )}
              {msg.text && <p>{msg.text}</p>}
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  )
}

export default ChatContainer