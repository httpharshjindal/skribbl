import { clientId, hostId } from "../HomePage";

const StartScreen = (onClickHandler:any) => {
  return (
    <div>
      {hostId == clientId ? (
        <div className="flex justify-center items-center flex-col z-50 ">
          <h1 className="font-bold text-3xl text-white">Start The Game</h1>
          <button
            className="bg-green-400 rounded-lg w-72 h-10 text-white text-lg font-semibold"
            onClick={() => {
              onClickHandler();
            }}
          >
            START
          </button>
        </div>
      ) : (
        <h1 className="font-bold text-3xl text-white ">
          Waiting For The Host To Start
        </h1>
      )}
    </div>
  );
};
export default StartScreen;
