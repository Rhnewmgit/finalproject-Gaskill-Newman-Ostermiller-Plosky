import { useRef } from "preact/hooks";
export function ShareDialog(props : {user:string}){
    //get the website name
    const link = `${window.location.origin}/user/${props.user}`;
    const dialogRef = useRef<HTMLDialogElement>(null);
    const copyLink = async ()=>{
        try{
            await navigator.clipboard.writeText(link);
        }catch(error:unknown){
            if(error instanceof Error){
                console.error(error.message);
            }
            else{
                console.error("Unknown error", error);
            }
        }
    }
    const openDialog = () =>{
        dialogRef.current?.showModal();
    }
    const closeDialog = ()=>{
        dialogRef.current?.close();
    }
    return (<>
            <button onClick={openDialog}>Share Schedule</button>
            <dialog ref={dialogRef} id='share'>
                <header>
                    <button onClick={closeDialog}>X</button>
                </header>
                <p>Want to share your schedule with other users? Click 'copy' and send them this link</p>
                <input type='text' readonly value={link}/> <button onClick={copyLink}>Copy</button>
            </dialog>
        </>)
}