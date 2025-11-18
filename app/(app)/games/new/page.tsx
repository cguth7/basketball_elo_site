import { createGame } from '@/lib/actions/games'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function NewGamePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Start a New Game</h1>
        <p className="mt-2 text-gray-600">
          Choose the team size and get started at Pottruck
        </p>
      </div>

      <Card className="p-6">
        <form action={createGame} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Team Size
            </label>
            <div className="grid grid-cols-2 gap-4">
              {['1v1', '2v2', '3v3', '4v4', '5v5'].map((size) => (
                <label
                  key={size}
                  className="relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm focus:outline-none hover:border-orange-500 transition-colors"
                >
                  <input
                    type="radio"
                    name="team_size"
                    value={size}
                    className="sr-only"
                    required
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-lg font-medium text-gray-900">
                        {size}
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        {size.charAt(0)} players per team
                      </span>
                    </span>
                  </span>
                  <svg
                    className="h-5 w-5 text-orange-600 opacity-0 peer-checked:opacity-100"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-blue-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  How it works
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You'll be the game host</li>
                    <li>Share the game link with other players</li>
                    <li>Players can join up until you submit the result</li>
                    <li>After the game, submit the winning team</li>
                    <li>ELO ratings update automatically</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Start Game
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
