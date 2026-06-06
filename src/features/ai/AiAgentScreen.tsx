import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Bot, User } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { useAiChatHistory, useSendAiMessage, useSessionUser } from '../../lib/query/hooks'
import { copy } from '../../copy/pt-BR'

export function AiAgentScreen() {
  const { data: sessionUser } = useSessionUser()
  const userId = sessionUser?.id || 'u_me'

  const { data: chatHistory, isLoading } = useAiChatHistory(userId)
  const sendAiMessageMutation = useSendAiMessage()

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory, isTyping])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userText = input.trim()
    setInput('')
    setIsTyping(true)

    try {
      // 1. Post User message
      await sendAiMessageMutation.mutateAsync({
        userId,
        role: 'user',
        content: userText,
      })

      // 2. Mock AI Agent reply
      setTimeout(async () => {
        let aiReply = 'Hum, deixa eu ver o que combina com seu bonde... 🧐'
        if (userText.toLowerCase().includes('pizza')) {
          aiReply = 'Pô, se a pegada é pizza, você PRECISA colar na *Fornazza*! A galera no seu bonde vive elogiando o custo-benefício de lá. Quer que eu te passe o endereço? 🍕🔥'
        } else if (userText.toLowerCase().includes('hambúrguer') || userText.toLowerCase().includes('burger')) {
          aiReply = 'Olha, para hambúrguer o *Podrão do Zé* é imbatível na larica da madrugada, mas se quer algo mais clean, a *Hamburgueria Gourmet* em Pinheiros tem nota 4.8 em Sabor pela galera! 🍔✨'
        } else {
          aiReply = 'Achei aqui! Com base no histórico de reviews que você curtiu, o japonês *Sushi Garden* é a melhor pedida hoje. O atendimento de lá é amassado demais (5/5)! Bora colar? 🍣👀'
        }

        await sendAiMessageMutation.mutateAsync({
          userId,
          role: 'assistant',
          content: aiReply,
        })
        setIsTyping(false)
      }, 1500)

    } catch (err) {
      toast('Algo deu ruim no envio!', 'error')
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-md mx-auto">
      {/* Header info */}
      <div className="border-b border-[#2D2D2D] pb-3 mb-4">
        <h1 className="text-xl font-extrabold text-white flex items-center gap-1.5">
          <Bot className="text-secondary" />
          <span>{copy.ai.chatTitle}</span>
        </h1>
        <p className="text-[10px] text-[#A0A0A0]">Pergunte dicas de picos baseadas no gosto do seu bonde.</p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
        {isLoading ? (
          <div className="text-center py-10 text-xs text-[#808080]">Carregando conversas...</div>
        ) : chatHistory && chatHistory.length > 0 ? (
          chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                msg.role === 'user' ? 'bg-primary text-white' : 'bg-secondary text-white'
              }`}>
                {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
              </div>
              <div className={`rounded-2xl p-3 text-xs max-w-[80%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-[#1A1A1A] border border-[#2D2D2D] text-white rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
            <div className="h-12 w-12 rounded-full bg-secondary/15 flex items-center justify-center text-secondary border border-secondary/20 animate-pulse">
              <Sparkles size={20} />
            </div>
            <p className="text-xs text-[#A0A0A0] max-w-xs leading-relaxed">
              Salve! Eu sou o assistente do Rango. Onde você quer colar hoje? Fala sua preferência ou orçamento que eu acho o pico ideal.
            </p>
          </div>
        )}

        {isTyping && (
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-white text-xs">
              <Bot size={13} />
            </div>
            <div className="bg-[#1A1A1A] border border-[#2D2D2D] text-[#808080] text-xs rounded-2xl rounded-tl-none p-3 animate-pulse">
              Digitando... 🤖
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder={copy.ai.chatPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-full border border-[#2D2D2D] bg-[#1A1A1A] px-4 py-3 text-xs text-white outline-none focus:border-secondary transition-all"
        />
        <Button
          type="submit"
          className="h-10 w-10 p-0 rounded-full bg-secondary hover:bg-secondary/90 text-white flex items-center justify-center shadow-[0_0_10px_rgba(123,97,255,0.2)]"
        >
          <Send size={15} />
        </Button>
      </form>
    </div>
  )
}
