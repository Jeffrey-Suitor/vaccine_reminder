import React, {useContext, useState} from 'react';

const StageContext = React.createContext(0);

const StageUpdateContext = React.createContext({
  prevStage: () => {},
  nextStage: () => {},
});

export function useStage() {
  return useContext(StageContext);
}

export function useUpdateStage() {
  return useContext(StageUpdateContext);
}

export function StageProvider({children}) {
  const [stage, setStage] = useState(0);

  const nextStage = () => {
    setStage(curStage => curStage + 1);
  };
  const prevStage = () => {
    setStage(curStage => curStage - 1);
  };

  return (
    <StageContext.Provider value={stage}>
      <StageUpdateContext.Provider value={{prevStage, nextStage}}>
        {children}
      </StageUpdateContext.Provider>
    </StageContext.Provider>
  );
}
