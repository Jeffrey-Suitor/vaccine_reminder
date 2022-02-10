import React, {useContext, useState} from 'react';

type SheetTogglesState = {
  mergeDirection: 'Up' | 'Down';
  showPreview: boolean;
  showColours: boolean;
  showUnselected: boolean;
};

const SheetTogglesContext = React.createContext(null);
const SheetTogglesUpdateContext = React.createContext(null);
export const useSheetToggles = () => useContext(SheetTogglesContext);
export const useUpdateSheetToggles = () => {
  return useContext(SheetTogglesUpdateContext);
};

export function SheetTogglesProvider({children}) {
  const [toggles, setToggles] = useState<SheetTogglesState>({
    mergeDirection: 'Up',
    showPreview: false,
    showColours: true,
    showUnselected: false,
  });

  function setMergeDirection(direction: 'Up' | 'Down') {
    setToggles({...toggles, mergeDirection: direction});
  }

  function setShowPreview(show: boolean) {
    setToggles({...toggles, showPreview: show});
  }

  function setShowColours(show: boolean) {
    setToggles({...toggles, showColours: show});
  }

  function setShowUnselected(show: boolean) {
    setToggles({...toggles, showUnselected: show});
  }

  return (
    <SheetTogglesContext.Provider value={{...toggles}}>
      <SheetTogglesUpdateContext.Provider
        value={{
          setMergeDirection,
          setShowPreview,
          setShowColours,
          setShowUnselected,
        }}
      >
        {children}
      </SheetTogglesUpdateContext.Provider>
    </SheetTogglesContext.Provider>
  );
}
