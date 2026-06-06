import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
          Rango Social
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          O aplicativo do seu bonde gastronômico 🍔
        </p>
      </header>

      <main className="mt-8 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90 active:scale-95"
        >
          Contador: {count}
        </button>
      </main>
    </div>
  )
}

export default App
