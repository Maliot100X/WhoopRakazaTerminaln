# Making the helper a real AI chat (needs your key)

Today the floating helper (`src/components/Chatbot.tsx`) is **not** a large language model. It searches the project's own notes (`src/brain/*.md`, the original terminal's docs and its 68-route map) with BM25, trims to a sentence boundary, shows the source, and can open tabs and run terminal commands. It never guesses, and it says when it has no answer.

To make it a real LLM chat that still "knows everything", keep the same notes as context. This needs an API key from an LLM provider (OpenAI, Anthropic, Groq, Google ...). **I did not add one. Give the key only through a Whop app secret, never in chat or in the repo.**

Plan:
1. Owner picks a provider and creates a key.
2. Add it as an app secret named `LLM_API_KEY` (in the Whop AI chat the agent shows an `edit_secret` card; you paste the key into the field).
3. Add a server function (TanStack Start `createServerFn`) `askBrain({question, history})` that: runs the same `search()` to pick the top 6 chunks, builds a prompt = `brain.md` identity rules + chunks + the question, calls the provider with `LLM_API_KEY`, and returns the answer plus the chunk sources.
4. In `Chatbot.tsx`, call `askBrain` when no local intent matches, and keep the local intents (open tab, run command, live price) as they are.
5. Rate-limit per visitor and cap output tokens. Never send visitor data other than the question.
6. Keep the rule from `brain.md`: if the notes do not contain the answer, say so.

Cost note: every visitor question costs tokens on the owner's key.
