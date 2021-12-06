import { fork } from "child_process";

type SheetOutputPreviewProps = {
    originalArray: Array<Array<any>>,
    top: number,
    right: number
    bottom: number,
    left: number,
    uniqueIdCol: number,
    mergeDirection: string,
}

export default function SheetOutputPreview({originalArray, top, right, bottom, left, uniqueIdCol, mergeDirection}: SheetOutputPreviewProps) {

    var header = originalArray[0];
    var direction = mergeDirection == "Up" ? -1 : 1;
    var new_array = [];
    var temp_array = [];

    var _mod_top = top < 1 ? 1: top;
    var _mod_left = left < 1 ? 1: left;


    for (var i = _mod_top-1; i < bottom-1; i++) {
        temp_array = originalArray[i];
        for (var j = _mod_left-1; j < right-1; j++) {
            if (originalArray[i][uniqueIdCol-1] == null) {
                break;
            }
            temp_array[j] = [originalArray[i+direction][j], originalArray[i][j]];
        }
        new_array.push(temp_array.slice(left-1, right-1));
    }

    console.log(new_array)


   return (
         <>
            lkajsdflkjdsal
         </>
    )
}
