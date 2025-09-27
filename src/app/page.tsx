import Game from '@/components/Game'
import WinnersTicker from '@/components/WinnersTicker'
import Leaderboard from '@/components/Leaderboard'

export default function Page() {
  return (
    <div>
      <WinnersTicker />
      <Game />
      <Leaderboard />
    </div>
  )
}
