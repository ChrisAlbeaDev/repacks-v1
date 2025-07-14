import { Button } from './Button'; 

interface HomePageProps {
  onGoToPlayers: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGoToPlayers }) => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Welcome to OPTCG App
      </h1>
      <Button
        onClick={onGoToPlayers}
        variant="primary"
        size="lg"
      >
        Go to Players List
      </Button>
    </div>
  );
};